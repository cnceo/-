var GlobalManager = require("GlobalManager");
var ProtocolMessage = require("ProtocolMessage");
var constDef = require("ConstDef");
var gameConstDef = require("YingsanzhangConstDef");

cc.Class({
    extends: cc.Component,

    properties: {
        
        operation_node:{
            default:null,
            type:cc.Node
        },
        
    },

    onLoad: function () {
        this.refreshUI();
    },
    follow_bet_req: function(){

        let score = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nTeamID).nCurBetVal;
        let msg = new ProtocolMessage(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang,gameConstDef.MESSAGE.FOLLOW_BET_REQ,false); 
        ProtocolMessage.AddVectItemByte(msg._body_msg, score);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
    },
    add_bet_req: function(){

        let score = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nTeamID).nCurBetVal;
        let msg = new ProtocolMessage(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang,gameConstDef.MESSAGE.ADD_BET_REQ,false);           
        ProtocolMessage.AddVectItemByte(msg._body_msg, score);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
    },
    look_card_req: function(){

        let score = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nTeamID).nCurBetVal;
        let msg = new ProtocolMessage(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang,gameConstDef.MESSAGE.LOOK_CARD_REQ,false);           
        ProtocolMessage.AddVectItemByte(msg._body_msg, 1);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);
    },
    compare_card_req: function(){

        let score = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nTeamID).nCurBetVal;
        let msg = new ProtocolMessage(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang,gameConstDef.MESSAGE.COMPARE_CARD_REQ,false);           
        ProtocolMessage.AddVectItemByte(msg._body_msg, score);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);        
    },
    discard_req: function(){

        let score = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nTeamID).nCurBetVal;
        let msg = new ProtocolMessage(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang,gameConstDef.MESSAGE.DISCARD_REQ,false);           
        ProtocolMessage.AddVectItemByte(msg._body_msg, 1);
        GlobalManager.instance.SocketManager.SendMessage(constDef.SERVER_URL.game, msg);        
    },
    refreshUI: function(){
        
        var follow_node = this.operation_node.getChildByName("follow_bet");    
        var add_node = this.operation_node.getChildByName("add_bet");    
        var look_node = this.operation_node.getChildByName("look_card");    
        var compare_node = this.operation_node.getChildByName("compare_card");    
        var discard_node = this.operation_node.getChildByName("discard");    

        let normal_url =  "Games/Yingsanzhang/res/image/sceneWar/button_normal";
        let disable_url =  "Games/Yingsanzhang/res/image/sceneWar/button_disable";
        let follow_url =  "Games/Yingsanzhang/res/image/sceneWar/button_hl";
        let  tag = 1;
        if(tag > 0.5)
        {
            this.loadSpriteFrameWithUrlAndNode(follow_node,follow_url);
            this.loadSpriteFrameWithUrlAndNode(add_node,normal_url);
            this.loadSpriteFrameWithUrlAndNode(look_node,normal_url);
            this.loadSpriteFrameWithUrlAndNode(compare_node,normal_url);
            this.loadSpriteFrameWithUrlAndNode(discard_node,normal_url);            
        }
        else
        {
            this.loadSpriteFrameWithUrlAndNode(follow_node,disable_url);
            this.loadSpriteFrameWithUrlAndNode(add_node,disable_url);
            this.loadSpriteFrameWithUrlAndNode(look_node,disable_url);
            this.loadSpriteFrameWithUrlAndNode(compare_node,disable_url);
            this.loadSpriteFrameWithUrlAndNode(discard_node,disable_url);   
        }

        
    },
    loadSpriteFrameWithUrlAndNode: function(node,url)
    {
        cc.loader.loadRes(url,cc.SpriteFrame,function(error ,spriteFrame){
            if(!error)
            {
                node.getComponent(cc.Sprite).spriteFrame = spriteFrame;    
            }
            else
            {
                cc.log("loader_url:",url,"error:",error)
            }
            
        })
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
