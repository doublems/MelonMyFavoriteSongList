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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var request = require('request');
const cheerio = require('cheerio')
request('https://www.melon.com/mymusic/like/mymusiclikesong_listPaging.htm?startIndex=0&pageSize=20&memberKey=5221201&orderBy=UPDT_DATE', function (error, response, body) {
    //console.log('error:', error); // Print the error if one occurred
    //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    //console.log('body:', body); // Print the HTML for the 멜론 homepage.
    const $ = cheerio.load(body);
    //내가 좋아요를 누른 가수 목록;
    const class_b = $('a', $('.ellipsis'));
    //https://www.npmjs.com/package/cheerio  // API참조
    class_b.each(function(index){
      ++index; // 숫자를 읽기 쉽게 1을 더함
      //index 1:상세페이지로감, 2:곡명, 3:가수명, 4:가수명, 5:앨범명 ==> 이번의 경우 2,4,5 필요
        //이후는 6,7,8,9,10인데.. 이것을 5로 나눠서 나머지로 구분하겠다. ==> 곡명은 2, 가수명은 4, 앨범명은 0
        if(index%5 === 2){console.log($(this).text());} // 곡명
        if(index%5 === 4){console.log($(this).text());} // 가수명
        if(index%5 === 0){console.log($(this).text());} // 앨범명
    });
});
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
