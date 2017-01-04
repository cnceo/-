var GlobalManager = require("GlobalManager");
var ProtocolMessage = require("ProtocolMessage");
var gameConstDef = require("YingsanzhangConstDef");
cc.Class({
    extends: cc.Component,
    
    properties: {
        
        
       backGround:{
           default:null,
           type:cc.Node,
       },
       cards_node:{
           default:null,
           type:cc.Node
       },
       progressBar:{
           default:null,
           type:cc.ProgressBar
       },
       headImg:{
          default:null,
          type:cc.Sprite
       },
       nameLabel:{
           default:null,
           type:cc.Label
       },
       allmoney:{
           default:null,
           type:cc.Label
       },
       mainNode:{
           default:null,
           type:cc.Node 
       },
       side_node:{
           default:null,
           type:cc.Node
       },
       lookCard_node:{
           default:null,
           type:cc.Sprite
       },
        cardType_node:{
           default:null,
           type:cc.Sprite
       },
       bet:{
           default:null,
           type:cc.Label
       },
       prefab_card:{
         default:null,
         type:cc.Prefab
       },
       liewen:{
           default:null,
           type:cc.Node
       },
       compareNode:{
           default:null,
           type:cc.Node,
       },
       cards_array:[],
       isLook:false,
       
    },

    // use this for initialization
    onLoad: function () {

    },
    
    InitInfo:function(sitSeq)
    {
        this.nSelfPos = sitSeq;
        this.nSelfIndex = sitSeq;

       this.mainNode.opacity = 0;
       this.side_node.opacity = 0;

        switch(sitSeq)
        {
            case 1:
            {
                this.node.setPosition(cc.v2(820,-775));
                this.side_node.setPosition(cc.v2(250,0));
            }
            break;
            case 2:
            {
                this.node.setPosition(cc.v2(200,-700));
                this.side_node.setPosition(cc.v2(250,0));
                
            }
            break;
            case 3:
            {
                this.node.setPosition(cc.v2(200,-330));
                this.side_node.setPosition(cc.v2(250,0));
                
            }
            break;
            case 4:
            {
                this.node.setPosition(cc.v2(1710,-330));
                this.side_node.setPosition(cc.v2(-250,0));
                
            }
            break;
            case 5:
            {
                this.node.setPosition(cc.v2(1710,-700));
                this.side_node.setPosition(cc.v2(-250,0));
                                
            }
            break;                                                         
        }
    },

    UpDateView: function(nCurIndex)
    {
        this.nSelfIndex = nCurIndex;
        this.RefreshView();
    },
    RefreshSideView: function(nCurIndex)
    {
        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);
        let playerInfo = gameData.vectTeamList[nCurIndex];
        if(playerInfo.nAccountID  === 0)
        {
            this.node.opacity = 0;
        }
        else
        {
            this.node.opacity = 255;
            this.side_node.opacity = 255;
            if(playerInfo.nLookFlag > 0)
            {
                if(gameData.nAccountID == playerInfo.nAccountID)
                {
                    this.showOpenCard();
                }
                else
                {
                    this.OtherPlayerOpenCard();
                }
            }

        }
    },
    RefreshView: function()
    {
        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);

        let playerInfo = gameData.vectTeamList[this.nSelfIndex-1];

        if(playerInfo.nAccountID  === 0)
        {
            this.node.opacity = 0;
        }
        else
        {
            this.node.opacity = 255;
            this.mainNode.opacity = 255;
            if(playerInfo.nick !== null) 
            {
                this.nameLabel.string = playerInfo.nick;
            }
            if(playerInfo.nCoinL !== null)
            {
                this.allmoney.string = playerInfo.ncoinL;       
            }
            // cc.loader.loadRes("Games/Yingsanzhang/res/prefab/Player/image/head/head_"+playerInfo.nFhead,cc.SpriteFrame,function(error,spriteFrame){
            //     if(!error)
            //     {
            //         this.headImg.spriteFrame = spriteFrame;
            //     }
            // });

        }
    },
    //  显示结果  1 弃牌 2 看牌 3 输
    showLookNode: function(type){
        this.lookCard_node.spriteFrame = null;
        var  base_url = "Games/Yingsanzhang/res/prefab/Player/image/";
        var  type_url;
        switch (type) {
            case gameConstDef.PLAYER_OPERATION_TYPE.OPERATION_DISCARD:
                type_url = "discard";
                break;
            case gameConstDef.PLAYER_OPERATION_TYPE.OPERATION_LOOKCARD:
                type_url = "look"                
                break;
            case gameConstDef.PLAYER_OPERATION_TYPE.OPERATION_LOSE:
                type_url = "lose"                
                break;                        
            default:
                break;
        }
        let img_url = base_url + type_url;
        let lookNode = this.lookCard_node;
        cc.loader.loadRes(img_url,cc.SpriteFrame,function(error,spriteFrame)
        {
            if(!error)
            {
                lookNode.spriteFrame = spriteFrame;
            }
        });
    },
    showLoseCard: function(){
        this.showLookNode(gameConstDef.PLAYER_OPERATION_TYPE.OPERATION_LOSE);
        this.showDisCard();
    },
    showDisCard: function(){
        this.showLookNode(gameConstDef.PLAYER_OPERATION_TYPE.OPERATION_DISCARD);        
        for(let i = 0;i<this.cards_array.length;i++)
        {
            let node = this.cards_array[i];
            let component = node.getComponent("Yingsanzhang_Card");
            component.SetDisCard(); 
        }
        this.liewen.active = true;
    },
    OtherPlayerOpenCard: function(){
        this.showLookNode(gameConstDef.PLAYER_OPERATION_TYPE.OPERATION_LOOKCARD);        
    },
    showOpenCard: function(){
        this.liewen.active = false;
        this.lookCard_node.spriteFrame = null;
        this.cardType_node.spriteFrame = null;
        for(let i = 0;i<this.cards_array.length;i++)
        {
            let node = this.cards_array[i];
            let component = node.getComponent("Yingsanzhang_Card");
            component.SetOpenCard(); 
        }
    },
    //显示进度条
    showProgressBar: function(time)
    {
        this.progressBar.active = true;
        this.progressBar.progress = 1;
        // 以秒为单位的时间间隔
        var interval = 0.1;
        // 重复次数
         var repeat = time/interval;
         //  速度
        let speed = 1/repeat;         
        var delay = 0;
        this.schedule(function() {
            this._updateProgressBar(this.progressBar,speed);
        }, interval, repeat, delay);
    },
    timeOver: function (){
        this.progressBar.active = false;
        this.progressBar.progress = 0;
        this.unscheduleAllCallbacks();
    },
    _updateProgressBar: function(progressBar,speed){
        var  progress = progressBar.progress;
        cc.log("progress:",progress);
        if(progress > 0 )
        {
            progress -= speed;
        }else{
            this.timeOver();
        }
        progressBar.progress = progress;
    },
    sendCards: function(){
        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);
        let playerInfo = gameData.vectTeamList[this.nSelfIndex-1];

        if(playerInfo.nAccountID  === 0)     return;
        this.side_node.opacity = 255;
        this.cards_node.active = true;

        var  cards = [];
        // cards.push[playerInfo.puke[0]];
        // cards.push[playerInfo.puke[1]];
        // cards.push[playerInfo.puke[2]];
        cards.push(23);//test
        cards.push(33);//test
        cards.push(43);//test
        this.cards_array = [];
        this.cards_node.removeAllChildren();
        var interval = 0.3;
         var repeat = 2;
        var delay = 0;
        var index = 0;
        this.schedule(function() {
         this.sendCard(cards[index++]);   
        }, interval, repeat, delay);
    },
    sendCard: function(value)
    {
        var prefab_card = cc.instantiate(this.prefab_card);
        prefab_card.setPosition(cc.v2(0, 0));
        prefab_card.scale = 0.6;
        var component = prefab_card.getComponent("Yingsanzhang_Card");
        component.InitCardInfo(value);
        this.cards_node.addChild(prefab_card);
        this.cards_array.push(prefab_card);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
