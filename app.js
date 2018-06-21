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
var memberKey = 5221201;

/*********나의 좋아요 곡 수량을 세기 -> 총 수량만큼 목록구하기 -> 갯수 출력************/
countMytotalFavoriteSongs(memberKey).then(count => findMyList(count,memberKey)).then(mySongList => mySongList.forEach((element, index, array) => console.log('a[' + index + '] = ' + element)));


/************나의 좋아요 곡 호출*****************/
function findMyList(endIndex, memberKey) {
    return new Promise(function (resolve, reject) {
        var mySongList = new Array();
        for (var startIndex = 0; startIndex < endIndex; startIndex += 20) {
            var url = "https://www.melon.com/mymusic/like/mymusiclikesong_listPaging.htm?startIndex=" + startIndex + "&pageSize=20&memberKey="+memberKey+"&orderBy=UPDT_DATE";

            findMyListParser(url, startIndex).then(function (myFavoriteSongs) {
                mySongList = mySongList.concat(myFavoriteSongs); //모든결과 이어붙이기

                // 계속 update되다가 마지막의 mySongList가 업데이트 된다. (//todo 공간이 한칸이 더생기는데. 이유를 모르겠다.)
                if((mySongList.length<=endIndex) === false){
                    console.log(mySongList.length);
                    resolve(mySongList);
                }
            });
        }
    });
}

/********내 리스트 크롤러**********/
function findMyListParser(url) {

    return new Promise(function (resolve, reject) {
        request(url, function (error, response, body) {
            const $ = cheerio.load(body); //크롤링후 파서기에 삽입

            let myFavoriteSongs = new Array(); //반환 할 결과값 리스트

            /***********내가 좋아요를 누른 목록******************/
                //https://www.npmjs.com/package/cheerio  // API참조
                //const myLike = $('span.odd_span, a.fc_mgray',$('.ellipsis'));
            const myLike = $('td');

            myLike.each(function (index) {
                //화면상에서 인덱스는 아래와 같음
                //index 0:체크박스, 1:NO, 2:곡명, 3:아티스트, 4:앨범, 5:앨범명, 6:좋아요, 7:뮤비, 8:다운로드/링벨==> 이번의 경우 2,3,4 필요
                //이후는 9.10,11,12,13,14인데.. 이것을 9으로 나눠서 나머지로 구분하겠다. ==> 곡명은 2, 가수명은 3, 앨범명은 4
                /******************반환결과 담기용*******************/
                var currentRoundNum = parseInt(index / 9);   //9개의 컬럼을 갖고있는 결과테이블의 라운드 반복은 index/9로 함

                if (myFavoriteSongs[currentRoundNum] === undefined) {
                    myFavoriteSongs.push(new Song());
                }

                /******************검색시작*******************/
                if (index % 9 === 2) {  //곡명 추출(빈칸제거,재생,담기,상세정보 페이지 이동 붙어나오면 삭제 후 줄띄기 수정)
                    var songName = $(this).text().replace("재생", "").replace("담기", "").replace("상세정보 페이지 이동", "").trim().split("\n\t")[0];
                    // console.log("노래명 : " + songName);
                    myFavoriteSongs[currentRoundNum].setSongName(songName);
                } else if (index % 9 === 3) { //가수명
                    //아티스트명 더보기 이후 삭제,
                    var singerName = $(this).text().trim().split("아티스트명 더보기")[0].trim();
                    var singerNameLength = singerName.length;
                    singerName = singerName.slice(0, (singerNameLength / 2)); //이름이 두번중복되서나옴 예) 마마무마마무 : 이런경우  전체길이/2를 해서 나온값까지만 읽게 하기.
                    //console.log("가수명 : " +singerName);
                    myFavoriteSongs[currentRoundNum].setSingerName(singerName)
                } else if (index % 9 === 4) { // 앨범명
                    var albumName = $(this).text().trim();
                    //console.log("앨범명 : " + albumName);
                    myFavoriteSongs[currentRoundNum].setAlbumName(albumName)
                }
                /******************검색 끝*******************/
                resolve(myFavoriteSongs);
            });
        });
    });


}

/***********내가 좋아요를 누른 전체 곡 갯수****************/
function countMytotalFavoriteSongs(memberKey) {
    return new Promise(function (resolve, reject) {
        var url = "https://www.melon.com/mymusic/like/mymusiclikesong_list.htm?memberKey=" + memberKey;
        request(url, function (error, response, body) {
            const $ = cheerio.load(body); //크롤링후 파서기에 삽입
            const class_a = $($('#totCnt'));
            class_a.each(function () {
                var returnVal = 0;
                returnVal = parseInt($(this).text().replace(",", ""));//parseInt 이전에는 1,304가 나타남. replace는 하지 않으면 쉼표(,)를 점으로 인식해서 parseInt 동작시 1로 나타남 --> 이것은 전체곡 갯수
                console.log("내가 좋아요를 누른 곡의 숫자는 :" + returnVal + "개 입니다.");
                resolve(returnVal);//좋아요 눌른 갯수 전송
            });
        });
    });
}

class Song {
    constructor() {
        this._songName;
        this._singerName;
        this._albumName;
    }

    getSongName() {
        return this._songName;
    }

    setSongName(value) {
        this._songName = value;
    }

    getSingerName() {
        return this._singerName;
    }

    setSingerName(value) {
        this._singerName = value;
    }

    getAlbumName() {
        return this._albumName;
    }

    setAlbumName(value) {
        this._albumName = value;
    }

    toString(){
        return "제목 :"+this._songName+"/" +this._albumName+"앨범에서"+this._singerName+"가 불렀습니다.";
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
