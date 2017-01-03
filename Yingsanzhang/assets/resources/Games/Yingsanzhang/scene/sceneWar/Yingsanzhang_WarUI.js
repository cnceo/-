var GlobalManager = require("GlobalManager");
var HintManager = require("HintManager");
var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");
var Utils = require("Utils");
var gameConstDef = require("YingsanzhangConstDef");

cc.Class({
    extends: cc.Component,

    properties: {

        NodePlayersUI:cc.Node,
        NodeMyControllerUI:cc.Node,
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {

        let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.FIGHT_READY_REQ,false); 
        ProtocolMessage.AddVectItemByte(msg._body_msg, 1);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);

    },
    RefreshUI:function(){
        cc.log("RefreshUI");
        this.NodePlayersUI.getComponent("Yingsanzhang_PlayersUI").initPlayers();

        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);

        if(gameData.nBattleStatus == gameConstDef.FIGHT_STATUS.BEGIN)
        {
            if(gameData.nClientStatus == gameConstDef.FIGHT_STATUS.C_BEGIN)
            {
                this.NodePlayersUI.getComponent("Yingsanzhang_PlayersUI").sendCard();        
            }
        }
    },
    
    RefreshPlayerData: function(type)
    {
        this.NodePlayersUI.getComponent("Yingsanzhang_PlayersUI").initPlayers();
        cc.log("War_RefreshPlayerData");

    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
