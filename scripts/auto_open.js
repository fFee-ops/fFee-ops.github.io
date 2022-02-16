var spawn = require('child_process').exec;
hexo.on('new', function(data){
  spawn('start  "D:\各种笔记\笔记软件\Typora\Typora.exe" ' + data.path);
});