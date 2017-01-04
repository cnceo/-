var GlobalManager = require("GlobalManager");
var HintManager = require("HintManager");
var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");
var Utils = require("Utils");
var gameConstDef = require("YingsanzhangConstDef");

cc.Class({
    extends: cc.Component,

    properties: {

        timeLabel: cc.Label,
        NodePlayersUI:cc.Node,
        NodeMyControllerUI:cc.Node,

    },

    // use this for initialization
    onLoad: function () {

        let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.FIGHT_READY_REQ,false); 
        ProtocolMessage.AddVectItemByte(msg._body_msg, 1);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);

    },

        onReady:function()
    {
        var curScene = cc.director.getScene();

        cc.find("Canvas/Players", curScene).getComponent("Yingsanzhang_PlayersUI").initPlayers();
        cc.find("Canvas/MyController", curScene).getComponent("Yingsanzhang_MyController").initConsole();
        // cc.find("Canvas/tips", curScene).getComponent("TipsController").ShowTipsIF();

        cc.find("Canvas/Players", curScene).getComponent("Yingsanzhang_PlayersUI").sendCard();        

    },
    
    RefreshPlayerData: function(type)
    {
        var curScene = cc.director.getScene();
        cc.find("Canvas/Players", curScene).getComponent("Yingsanzhang_PlayersUI").initPlayers();

    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        var date = new Date(GlobalManager.instance.GetRightTime()*1000);
        let sHour = date.getHours().toString();
        let sMin = date.getMinutes().toString();
        if (sHour.length == 1) sHour = "0" + sHour;
        if (sMin.length == 1) sMin = "0" + sMin;
        this.timeLabel.string = sHour+":"+sMin; 
    },
});
