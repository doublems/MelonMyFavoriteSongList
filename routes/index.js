var express = require('express');
var router = express.Router();

//내가 만든 좋아요 크롤러 호출
var findMymusic = require('../private_modules/findMyFavoriteMusic.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
    var memberKey = 5221201;
    findMymusic.countMytotalFavoriteSongs(memberKey).then(count => findMymusic.findMyList(count,memberKey)).then(mySongList => res.json(mySongList)); // express의 JSON을 사용하여 Array[Object]를 변경
});


var memberKey = 5221201;
/*********나의 좋아요 곡 수량을 세기 -> 총 수량만큼 목록구하기 -> 갯수 출력************/
//countMytotalFavoriteSongs(memberKey).then(count => findMyList(count,memberKey)).then(mySongList => mySongList.forEach((element, index, array) => console.log('a[' + index + '] = ' + element)));
//findMymusic.countMytotalFavoriteSongs(memberKey)//.then(count => findMymusic.findMyList(count,memberKey)).then(mySongList => JSON.stringify(mySongList)); // JSON.stringify를 사용하여 JSON to array로 변경

module.exports = router;
