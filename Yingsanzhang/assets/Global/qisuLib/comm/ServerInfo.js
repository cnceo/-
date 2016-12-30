var ServerInfo = function(url)
{
    this._url= url;
    
    this._web_sock = null;
    
    this.check=0;
    
    this.curMsg = null;
    this._flag_receive_step = 0; 
	this._msg=null;
	this.vectMsgQueue = new Array(0);
	this.nCurReceiveSeq = 0;
    
    this.timer=null;
	this.waitTimes = 0;
    
    this.StartTimer=function()
    {
        this.timer = window.setInterval(this.onTimer(),1000);  
    };
    this.StopTimer=function()
    {
        clearInterval(this.timer);
    };
    
    this.onTimer = function()
    {
        if (this.vectMsgQueue.length > 0) this.waitTimes++;
    };
};

module.exports = ServerInfo;

