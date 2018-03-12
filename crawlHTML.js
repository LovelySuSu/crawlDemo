/**
 * Created by dingding on 2018/3/12.
 */
var https = require('https');
var cheerio = require('cheerio');
var url = 'https://www.imooc.com/learn/348';


// 请求url地址,获取页面html
https.get(url,function (res) {
    var html = '';
    res.on('data',function(data){
        html += data;
    });
    res.on('end',function () {
        var courseData = filterCharpter(html);
        printChapter(courseData);
    });
    res.on('error',function () {
        console.log('系统异常');
    })
})

// 获取页面章节的函数
function filterCharpter (html) {
    var $ = cheerio.load(html);
    var chapters =$('.chapter');
    var courseData = [];
    chapters.each(function (value) {
        var chapter = $(this);
        var chapterTitle = chapter.find('strong').text().trim().split('\n')[0];
        var videos = chapter.find('.video').children('li');
        chapter = {
            chapterTitle : chapterTitle,
            videos:[]
        }
        videos.each(function(val){
            var video = $(this).find('a').text().trim();
            var videoName = video.split('\n')[0];
            var videoTime = video.split('\n')[1].trim();
            chapter.videos.push({name:videoName,time:videoTime});

        });
        courseData.push(chapter);
    });
   return courseData;
}
// 格式化打印页面
function printChapter (courseData) {
    courseData.forEach(function (val) {
        var chapterTitle = val.chapterTitle;
        console.log('章节标题:'+chapterTitle+'\n');
        val.videos.forEach(function (value) {
            console.log('  '+value.name+'时长:'+value.time+'\n');
        })
    })
}