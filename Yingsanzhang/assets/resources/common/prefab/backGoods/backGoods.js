cc.Class({
    extends: cc.Component,

    properties: {
       LabelName:cc.Label
    },
    onLoad: function () {

    },
    initInfo:function(data)
    {
        this.LabelName.string = data.name;
    }
});
