var spawn = require('child_process').exec;
hexo.on('new', function(data){
  spawn('open -a  "/Applications/Visual Studio Code.app" ' + data.path);
});