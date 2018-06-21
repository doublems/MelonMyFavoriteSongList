var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


var request = require('request');
const cheerio = require('cheerio');

//총 좋아요를 누른 곡 개수
//var totalNum = countMytotalFavoriteSongs(5221201); //이렇게 하고 싶은데..
//console.log(totalNum); //여기서 동기화 작업 필요. 안하면 계속 콜백으로 넘겨줘야 할듯.. ㅎㄷㄷ (우선넘겨봄)

countMytotalFavoriteSongs(5221201,function (endIndex) {
    let myFavoriteSongs = new Array();
    for(var startIndex = 0;startIndex<=endIndex;startIndex+=20){
        var url = "https://www.melon.com/mymusic/like/mymusiclikesong_listPaging.htm?startIndex=" + startIndex + "&pageSize=20&memberKey=5221201&orderBy=UPDT_DATE";
        console.log(url+"************************"+startIndex);
        findMyList(url,startIndex,myFavoriteSongs);
    }
    console.log(myFavoriteSongs.length); //todo 이거 하고 싶은데 안됨
});


//멜론은 음악리스트 검색을 20개씩 시도함
/*for(var startIndex = 0;startIndex<2000;startIndex+=20){
    var url = "https://www.melon.com/mymusic/like/mymusiclikesong_listPaging.htm?startIndex=" + startIndex + "&pageSize=20&memberKey=5221201&orderBy=UPDT_DATE";
    console.log(url+"************************"+startIndex);
   // findMyList(url,startIndex);
}*/

//currentIndex는 findMyList에서 전체사용가능
function findMyList(url,currentIndex,myFavoriteSongs) {


    request(url, function (error, response, body) {
        const $ = cheerio.load(body); //크롤링후 파서기에 삽입

        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //console.log('body:', body); // Print the HTML for the 멜론 homepage.

        //더이상 데이터 항목 없음
        const class_a = $('div', $('.no_data'));
        class_a.each(function () {
            console.log($(this).text());
        });

        //내가 좋아요를 누른 가수 목록;
        const myLike = $('a', $('.ellipsis'));
        //https://www.npmjs.com/package/cheerio  // API참조
        myLike.each(function (index) {
            ++index; // 숫자를 읽기 쉽게 1을 더함
            //index 1:상세페이지로감, 2:곡명, 3:가수명, 4:가수명, 5:앨범명 ==> 이번의 경우 2,4,5 필요
            //이후는 6,7,8,9,10인데.. 이것을 5로 나눠서 나머지로 구분하겠다. ==> 곡명은 2, 가수명은 4, 앨범명은 0

            var songName,singerName,albumName;

            if (index % 5 === 2) {  //곡명 (상세정보 페이지 이동 붙어나오면 삭제)
                songName = $(this).text().replace("상세정보 페이지 이동","").trim();
                //console.log(songName);
            }else if(index % 5 === 4) { //가수명
                singerName = $(this).text().trim();
                //console.log(singerName);
            }else if (index % 5 === 0) { // 앨범명
                albumName = $(this).text().trim();
                //console.log(albumName);
            }
            myFavoriteSongs.push(new Song(songName,singerName,albumName));
        });
        console.log("==============================================================================================");
        console.log(currentIndex);
        console.log("==============================================================================================");
    });
}

//todo 여기 콜백 개선 필요 -> 안하면 콜백헬 예약
function countMytotalFavoriteSongs(memberKey,callback) {
    var url = "https://www.melon.com/mymusic/like/mymusiclikesong_list.htm?memberKey="+memberKey;
    request(url, function (error, response, body) {
        const $ = cheerio.load(body); //크롤링후 파서기에 삽입
        //더이상 데이터 항목 없음
        const class_a = $($('#totCnt'));
        class_a.each(function () {
            var returnVal = 0;
            returnVal = parseInt($(this).text().replace(",",""));//parseInt 이전에는 1,304가 나타남. replace는 하지 않으면 쉼표(,)를 점으로 인식해서 parseInt 동작시 1로 나타남
            console.log(returnVal);
            callback(returnVal);
        });
    });
}

class Song{
    constructor(songName,singerName,albumName){
        this._songName = songName;
        this._singerName = singerName;
        this._albumName = albumName;
    }

    get songName() {
        return this._songName;
    }

    set songName(value) {
        this._songName = value;
    }

    get singerName() {
        return this._singerName;
    }

    set singerName(value) {
        this._singerName = value;
    }

    get albumName() {
        return this._albumName;
    }

    set albumName(value) {
        this._albumName = value;
    }
}



//////////////////////참고///////////////////////////////

//https://www.melon.com/mymusic/like/mymusiclikesong_list.htm?memberKey=5221201
//https://www.melon.com/mymusic/like/mymusiclikesong_listPaging.htm?startIndex=0&pageSize=20&memberKey=5221201&orderBy=UPDT_DATE


/*
//Dom을 읽고 수정해주는 도구
const $ = cheerio.load('<h2 class="title">Hello world</h2>')
console.log($('h2.title').text()); // => Hello world 출력

$('h2.title').text('Hello there!')
$('h2').addClass('welcome')

$.html()
//=> <h2 class="title welcome">Hello there!</h2>
*/


module.exports = app;
