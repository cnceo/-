var gameConstDef = require("YingsanzhangConstDef");
var GlobalManager = require("GlobalManager");

cc.Class({
    extends: cc.Component,

    properties: {
       
       prefab_player:{
           default:null,
           type:cc.Prefab
       },
        prefab_bet:{
           default:null,
           type:cc.Prefab
       },
        bet_table:{
           default:null,
           type:cc.Node
       },
       playersArray:[],
       
    },

    // use this for initialization
    onLoad: function () 
    {

        for (let i = 0; i < 5; i++) 
        {
            var player = cc.instantiate(this.prefab_player);
            var compon = player.getComponent("Yingsanzhang_Player");
            compon.InitInfo(i + 1);
            this.node.addChild(player);
            this.playersArray.push(player);
        }

    },
    initPlayers:function()
    {
        // var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);
        // var myTeamID = gameData.nTeamID;
        // let nSelfIndex = 0;
        // for (nSelfIndex=0; nSelfIndex<gameData.vectTeamList.length; nSelfIndex++)
        // {
        //     if (gameData.vectTeamList[nSelfIndex].nTeamID == myTeamID) break;
        // }
        // if (nSelfIndex == gameData.vectTeamList.length) return;

        // let nCurIndex = nSelfIndex;
        for(let i=0; i<this.playersArray.length; i++)
        {
            let playerComp = this.playersArray[i].getComponent("Yingsanzhang_Player");
            // playerComp.UpDateView(nCurIndex+1);   
            playerComp.UpDateView(i);
            // nCurIndex = (nCurIndex>=2)?0:(nCurIndex+1);
        }
    },
    sendCard: function(){
     var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);

        for(let i=0; i<this.playersArray.length; i++)
        {
            let playerComp = this.playersArray[i].getComponent("Yingsanzhang_Player");
            playerComp.sendCards();
        }        
        
    },
    selfFollowBet: function()
    {
        this.addBetFromPos(0,1000,1);
    },
    selfAddBet: function(){
        this.addBetFromPos(0,2000,2);
    },
    // pos  几号位下注  val 下注多少  type 砝码类型 1、2、3
    addBetFromPos: function(pos,val,type)
    {

        let  player_allbet_node = this.playersArray[pos].getChildByName("sideNode").getChildByName("bet");
        var  position  = player_allbet_node.convertToWorldSpace(this.bet_table.getPosition());
        let fromPosition = cc.v2(position.x-470,position.y+170);
        let  toPosition = this.randomPosition();
        let  bet = cc.instantiate(this.prefab_bet);
        let let_js = bet.getComponent("Yingsanzhang_Bet")
        bet.setPosition(fromPosition);
        let_js.setValueAndType(type,val);
        this.bet_table.addChild(bet);
        var actionBy = cc.moveTo(0.5, toPosition);
        bet.runAction(actionBy);
    },
    randomPosition: function(){
        let width = this.bet_table.width;
        let height = this.bet_table.height;
        let randomW = Math.random()*width/2;
        let randomH = Math.random()*height;
        return cc.v2(randomW+width/4,randomH);
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
