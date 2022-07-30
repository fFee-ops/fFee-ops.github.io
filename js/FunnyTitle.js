 var OriginTitle = document.title;
 var titleTime;
 document.addEventListener('visibilitychange', function () {
     if (document.hidden) {
         $('[rel="icon"]').attr('href', "https://img-blog.csdnimg.cn/20201114130457387.png#pic_center");
         document.title = '看不见我看不见我~';
         clearTimeout(titleTime);
     }
     else {
         $('[rel="icon"]').attr('href', "https://img-blog.csdnimg.cn/20201114130457387.png#pic_center");
         document.title = '欢迎回来！' + OriginTitle;
         titleTime = setTimeout(function () {
             document.title = OriginTitle;
         }, 2000);
     }
 });