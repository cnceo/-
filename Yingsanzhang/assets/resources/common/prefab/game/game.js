var constDef = require("ConstDef");
var GlobalManager = require("GlobalManager");

cc.Class({
    extends: cc.Component,

    properties: {
        NodeButton:cc.Node,
        NodeGrid:cc.Node,
        NodeButtonBox:cc.Node,
        SpriteIcon:cc.Sprite,
        LabelNumber:cc.Label,
        LabelPlayerNum:cc.Label,
        LabelGameName:cc.Label,
        LabelDesc:cc.Label,
        selfIndex:0,
        gameId:0
    },

    onLoad: function () {
        var ctx = this.NodeGrid.getComponent(cc.Graphics);
        ctx.moveTo(-540,-125);
        ctx.lineTo(1080,-125);
        ctx.stroke();

        var g = this.NodeButtonBox.getComponent(cc.Graphics);
        g.roundRect(-75,-35, 150,70, 10);
        g.stroke();

        this.NodeButton.on("touchend",this.onClickInstall,this);
    },
    initInfo:function(data)
    {
        this.selfIndex = data.index;
        this.gameId = data.gameId;
        this.LabelNumber.string = data.index;
        this.LabelGameName.string = data.name;
        if(typeof(data.onLineCount) === "undefined")
        {
            data.onLineCount = 0;
        }
        this.LabelPlayerNum.string = data.onLineCount + "人";
        this.LabelDesc.string = data.desc;
        
        var self = this;
        cc.loader.load(data.imgUrl,function(err,texture){
            var frame = new cc.SpriteFrame(texture);
            self.SpriteIcon.spriteFrame = frame;
        });
    },
    updateOnlineCount:function()
    {
       this.LabelPlayerNum.string = data.playersNum + "人";  
    },
    onClickInstall:function(event)
    {
        var gameId = this.gameId;
        GlobalManager.instance.GameNodeAddComponent(gameId,function(){
            GlobalManager.instance.selfData.nCurGameID = gameId; 
            GlobalManager.instance.GetGameController(gameId).SendMsg(constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_GAME_INFO);
        });
    }
});
