var md5 = require("md5");

var Utils = 
{
    SwapArrayItems : function(arr, index1, index2)
    {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    },
    
    md5Encrypt : function (val)
    {
        return md5.md5(val);
    },
    
    // 获取数字字串，比如 1234567 => 123.4万
    // 输入参数应为正整数
    GetNumberString:function(val) 
    {
        if (val < 10000)
        {
            return val.toString();
        }
        else if ((val >= 10000) && (val < 100000000))
        {
            val = val / 10000;
            val = val.toFixed(1);
            return val.toString() + "万";
        }
        else
        {
            val = val / 10000;
            val = val / 10000;
            val = val.toFixed(1);
            return val.toString() + "亿";
        }
    },

    GetHexString:function(val)
    {
        let tempName = val.toString(16);
        for (let i=0; i<8; i++)
        {
            if (tempName.length>=8) break;
            tempName = "0"+tempName;
        }   
        tempName = "0x" + tempName;
        return tempName;
    },
    CalcAngle(start,end)
    {
        let diff_x = end.x - start.x;
        let diff_y = end.y - start.y;
        if (end.x === start.x)
        {
            if (diff_y >= 0) return 0;            
            else return 180;
        }       
        else if (end.y === start.y)
        {
            if (diff_x>=0) return 90;
            else return 270;
        }
        else
        {
            if ((diff_x>0) && (diff_y>0))
            {
                return 360*Math.atan(diff_x/diff_y)/(2*Math.PI); 
            }
            else if ((diff_x<0) && (diff_y<0))
            {
                return 360*Math.atan(diff_x/diff_y)/(2*Math.PI) - 180;
            }
            else if ((diff_x>0) && (diff_y<0))
            {
                return 360*Math.atan(diff_x/diff_y)/(2*Math.PI)-180;
            }
            else if ((diff_x<0) && (diff_y>0))
            {
                return 360*Math.atan(diff_x/diff_y)/(2*Math.PI);
            }
            else
            {
                return 0;
            }
        }
    }     
};

module.exports = Utils;


