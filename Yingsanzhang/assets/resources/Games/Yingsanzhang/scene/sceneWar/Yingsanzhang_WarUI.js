var GlobalManager = require("GlobalManager");
var HintManager = require("HintManager");
var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");
var Utils = require("Utils");

cc.Class({
    extends: cc.Component,

    properties: {
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
    RefreshPlayerData: function()
    {
        cc.log("War_RefreshPlayerData");
    },
    // called every frame, uncomment this function to activate update callback
    update: function (dt) {

    },
});
