/**
 * Created by dingding on 2018/3/13.
 */
var https = require('https');
var cheerio = require('cheerio');

var baseUrl = 'https://www.imooc.com/learn/'
var videosArray = [728,637,348,259,197,134,75];
videosArray = videosArray.map(item => baseUrl+item);
// 创建promise
function getPageAsync(url){
    return new Promise(function(resolve,rejecte){
        // 请求url地址,获取页面html
        https.get(url,function (res) {
            var html = '';
            res.on('data',function(data){
                html += data;
            });
            res.on('end',function () {
                resolve(html);
            });
            res.on('error',function (error) {
                rejecte(error);
            })
        })
    })
}

// 获取页面章节的函数
function filterCharpter (html) {
    var $ = cheerio.load(html);
    var title  = $('.course-infos h2').text().trim();
    var page = {
        title:title,
        courseData:[]
    }
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
    page.courseData = courseData;
    return page;
}

// 打印章节内容
function printCourseData (coursesData) {
    coursesData.forEach(function(item){
        console.log('课程名:'+item.title+'\n');
        item.courseData.forEach(function(val){
            var chapterTitle = val.chapterTitle;
            console.log('   '+chapterTitle+'\n');
            val.videos.forEach(function (value) {
                console.log('      '+value.name+'时长:'+value.time+'\n');
            })
        })
        console.log('\n');
    })
}
// 所有页面的promise数组
var pagesPromiseArray = [];
videosArray.forEach(function(val){
    pagesPromiseArray.push(getPageAsync(val));
})

//promise.all方法
Promise
    .all(pagesPromiseArray)
    .then(function (pages) {
        var coursesData = [];
        pages.forEach(function(html){
            var courses = filterCharpter(html)
            coursesData.push(courses)
        })
        printCourseData(coursesData);
    })
    .catch (function (e) {
        console.log('程序异常');
    })