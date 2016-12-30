cc.Class({
    extends: cc.Component,

    properties: {
       
    },
    onLoad: function () {

    },
    setValueAndType: function(type,val)
    {
        cc.log("setValueAndType: function(type,val)");
        var img_url;
        switch (type) {
            case 1:
               img_url = "Games/Yingsanzhang/res/prefab/Bet/image/bet_red"; 
                break;
            case 2:
               img_url = "Games/Yingsanzhang/res/prefab/Bet/image/bet_green"; 
                break;
            case 3:
                img_url = "Games/Yingsanzhang/res/prefab/Bet/image/bet_org";
                break;                
        }
        let sprite =  this.node.getComponent(cc.Sprite);
        cc.loader.loadRes(img_url,cc.SpriteFrame,function(error,spriteFrame){
            if(!error)
            {
                sprite.spriteFrame = spriteFrame;
            }
        });

        let label = this.node.getChildByName("label").getComponent(cc.Label);

        label.string = val.toString();

    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
