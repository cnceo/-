cc.Class({
    extends: cc.Component,

    properties: {
        menuAnim: {
            default: null,
            type: cc.Animation
        },
    },
    onLoad: function () 
    {
        this.menuAnim.play('menu_reset');
        
        this.scheduleOnce ( function() 
        {
            this.menuAnim.play('menu_intro');
        }.bind(this), 0.5);
    },

    start: function () 
    {    
    },
});
