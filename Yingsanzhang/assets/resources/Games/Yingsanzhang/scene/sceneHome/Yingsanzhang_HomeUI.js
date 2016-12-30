var GlobalManager = require("GlobalManager");
var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");
var gameConstDef = require("YingsanzhangConstDef");


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

    },
    enter_room: function(){
        cc.log("enter_room");
        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);
        // var classicsItemComp = event.target.getComponent("doudizhuJD_classicsItem");  
        // constDef.SERVER_URL.game = classicsItemComp.serverUrl; 
        // gameData.nOpenMode = constDef.BATTLE_OPEN_MODE.TABLE;
        // gameData.nRoomID = classicsItemComp.roomID;
        var areaBaseInfo =  GlobalManager.instance.confData.getRoomArea(GlobalManager.instance.selfData.nCurGameID,1);

        var nodeBaseInfo =  GlobalManager.instance.confData.getGameNode(areaBaseInfo.Farea_id);
        
        var roomBaseInfo =  GlobalManager.instance.confData.getGameRoom(nodeBaseInfo[0].Fnode_id);

        var serverBaseInfo =  GlobalManager.instance.confData.getServerInfo(roomBaseInfo.Fserver_id);
        
        gameData.nOpenMode = constDef.BATTLE_OPEN_MODE.TABLE;
        gameData.nRoomID = roomBaseInfo.Froom_id;

        constDef.SERVER_URL.game = "ws://" + serverBaseInfo.Fserver_ip + ":" + serverBaseInfo.Fserver_port + "/";

        GlobalManager.instance.GetGameController(GlobalManager.instance.selfData.nCurGameID).SendMsg(gameConstDef.CONNECT_CALLBACK_STATUS.HOME_ENTER_ROOM);
        
        
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
