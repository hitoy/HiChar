/*
 *HiChart库 用于canvas绘图
 *Author Hito 2015年7月
 */
function Hichart(canvasobj,left,bottom){
    //获取Canvas对象
    try{
        var cxt = canvasobj.getContext("2d");
    }catch(e){
        throw "Get Canvas Failure!";
    }

    //left和bottom分别表示数据表距离左边和下边的距离
    var left = left;
    var bottom = bottom;


    //canvas对象的width,height 
    var width=canvasobj.getAttribute("width");
    var height=canvasobj.getAttribute("height")-10;

    //需要绘制的数据信息
    var casdata=new Array();

    //需要绘图的数据个数
    var dsize=0;

    //Y轴数据坐标个数
    var y_coor_size=0;
    //Y轴数据坐标间隔
    var y_coor_step=0;
    //Y轴坐标数据的起始数据 
    var y_coor_start=0;
    var y_coor_end=0;

    //X轴数据坐标个数
    var x_coor_size=0;
    //X轴数据坐标间隔
    var x_coor_step=0;

    //Y和X轴最大的间隔个数
    var y_coorsize=8;
    var x_coorsize=30;

    //Y和X轴指标文字描述
    var y_coor_text_des="Inquiry";
    var x_coor_text_des="Date";

    //往里加入数据，二维数组
    this.add_data = function(){
        var args = arguments;
        if(args.length==3){
            x_coor_text_des=arguments[1];
            y_coor_text_des=arguments[2];
        }else if(args.length==2){
            x_coor_text_des=arguments[1];
        }
        casdata=arguments[0];
        dsize=casdata.length;

        if(!(casdata instanceof Array)){
            throw "Parameter error";
        }

        var x_data=new Array();
        var y_data=new Array();
        //对二维数组进行遍历分析
        for(var i =0; i< casdata.length; i++){
            x_data.push(casdata[i][0]);
            y_data.push(casdata[i][1]);
        }
        //Y轴的最大数和最小数
        var y_max=Math.max.apply(null,y_data);
        var y_min=Math.min.apply(null,y_data);

        if(y_min*y_coorsize < y_max){
            y_coor_start=y_min;
            y_coor_step=Math.ceil((y_max-y_min)/y_coorsize);
            y_coor_end=y_coor_start+y_coor_step*y_coorsize;
        }else{
            y_coor_start=0;
            y_coor_step=Math.ceil(y_max/y_coorsize);
            y_coor_end=y_coor_step*y_coorsize;
        }
        //X轴分析
        if(dsize <= 30){
            x_coorsize = dsize+1;
        }
    }

    var data_to_coor=function(){
        //如果数据过多，则只分析30条数据
        //默认为最侯的30条数据
        var coor_data= casdata;
        while(coor_data.length>30){
            coor_data.shift();
        }

        //数据密度
        var y_density=y_coor_step/(Math.floor((height-bottom)/y_coorsize));
        var x_density=(width-left)/x_coorsize;

        var coor=new Array();
        for(var i =0; i < coor_data.length;i++){
            xp=(i+1)*x_density+left;
            yp=height-bottom-(coor_data[i][1]-y_coor_start)/y_density;
            coor[i]=[xp,yp,coor_data[i][1]];
        }
        return coor;
    }

    //根据坐标画走势图
    //coorobj为二维数组，格式[['x坐标','y坐标','实际数据']]
    var draw_line=function(coorobj,linecolor,pointcolor,linewidth){
        cxt.strokeStyle=linecolor;
        cxt.fillStyle=pointcolor;
        cxt.lineWidth=linewidth;
        if(coorobj.length > 1){
                var coor=coorobj[0];
                cxt.beginPath();
                cxt.arc(coor[0],coor[1],3,0,Math.PI*2);
                cxt.closePath();
                cxt.fill();

                cxt.save();
                cxt.translate(coor[0],coor[1]);
                cxt.fillText(coor[2],5,10);
                cxt.restore();

                cxt.moveTo(coor[0],coor[1]);
                cxt.lineTo(coorobj[1][0],coorobj[1][1]);
                cxt.stroke();
                coorobj.shift();
                return draw_line(coorobj,linecolor,pointcolor);
        }else if(coorobj.length == 1){
            var coor=coorobj[0];
                cxt.beginPath();
                cxt.arc(coor[0],coor[1],3,0,Math.PI*2);
                cxt.closePath();
                cxt.fill(); 

                cxt.save();
                cxt.translate(coor[0],coor[1]);
                cxt.fillText(coor[2],5,10);
                cxt.restore();
                return ;
        }
    }

    //画坐标系
    var draw_coor=function(coorstyle,fontstyle,textcolor){
        step=Math.floor((height-bottom)/y_coorsize);
        cxt.moveTo(left,height-bottom);
        for(var i = 1 ; i < (y_coorsize+1) ; i ++){
            cxt.lineTo(left,height-bottom-step*i);
            cxt.lineTo(left-8,height-bottom-step*i);
            cxt.moveTo(left,height-bottom-step*i);
            cxt.save();
            cxt.translate(left,height-bottom-step*i);
            cxt.font=fontstyle;
            cxt.fillStyle=textcolor;
            cxt.fillText(y_coor_step*i,-30,6,20);
            cxt.restore();
        }
        cxt.lineTo(left,0);

        cxt.moveTo(left,height-bottom);
        step=(width-left)/x_coorsize;
        for (var i = 0 ; i < x_coorsize ; i++ ){
            cxt.lineTo(left+step*i,height-bottom);
            cxt.lineTo(left+step*i,height-bottom-8);
            cxt.moveTo(left+step*i,height-bottom);
            cxt.fillStyle=textcolor;
            if(i<x_coorsize-1){
                var xdata=casdata[i][0];
                var xdatawidth=cxt.measureText(xdata).width;
                cxt.fillText(xdata,left+step*(i+1)-xdatawidth/2,height-bottom+11);
            }
        }
        cxt.lineTo(width,height-bottom);

        cxt.strokeStyle=coorstyle;
        cxt.stroke();
    }


    //画线性图
    this.draw_linear_graph=function(coorstyle,fontstyle,textcolor,linecolor,pointcolor,linewidth){
            cxt.clearRect(0,0,width,height);
            draw_coor(coorstyle,fontstyle,textcolor);   
            draw_line(data_to_coor(),linecolor,pointcolor,linewidth);
            //console.log(canvasobj.parentNode.childNodes);
            //canvasobj.parentNode.getElementById("y_des").innerHTML=y_coor_text_des;
            //canvasobj.parentNode.getElementById("x_des").innerHTML=x_coor_text_des;
            document.getElementById("y_des").innerHTML=y_coor_text_des;
            document.getElementById("x_des").innerHTML=x_coor_text_des;

    }


    //获取数据总量
    //帮助画饼状图
    var getsum = function(){
        var sum=0;
        for(var i =0; i < casdata.length;i++){
            sum+=casdata[i][1];
        }
        return sum;
    }

    //获取饼状图的颜色
    var getcolor=function(){
        var dic=new Object();
        for(var i =0; i < casdata.length; i++){
            var key = casdata[i][0];
            var value = "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
            dic[key]=value;
        }
        return dic;
    }

    //画饼状图
    this.draw_pie_graph=function(){
            cxt.clearRect(0,0,width,height);
            var basepx=width/2;
            var basepy=height/2;
            var radius=Math.min(basepx,basepy)-10;
            var sum=getsum();

            var coldic=getcolor();
            //弧线开始的度数
            var start=0;
            for(var i = 0; i < casdata.length; i++){
                var data=casdata[i][1];
                //每次画弧线的X和Y坐标
                var dotx=basepx+radius*(Math.cos(start));
                var doty=basepy+radius*(Math.sin(start));

                //弧线的终止度数
                var end = (data/sum)*Math.PI*2 + start;

                cxt.moveTo(basepx,basepy);
                cxt.beginPath();   
                cxt.lineTo(dotx,doty);
                cxt.arc(basepx,basepy,radius,start,end);
                cxt.lineTo(basepx,basepy);
                cxt.closePath();
                cxt.fillStyle=coldic[casdata[i][0]];
                cxt.fill();
                //下一个start等于end
                start = end;
            }

            //颜色刻度表
            var i =0;
            for(var j in coldic){
                //console.log(i);
                var text = j;
                var color = coldic[j];
                //console.log(color);
                cxt.fillStyle=color;
                cxt.fillRect(10,20*i,30,12);

                cxt.fillStyle="#fff";
                cxt.font="normal normal normal 12px Verdana";
                cxt.fillText(text+" ("+casdata[i][1]+")",60,20*i+10);
                i++;
            }
            document.getElementById("y_des").innerHTML="";
            document.getElementById("x_des").innerHTML="";
    }


    this.clear=function(){
       cxt.clearRect(0,0,width,height);
    }
    //填充数字
    this.draw_text=function(text,color,font,left,top){
        cxt.save();
        var twidth = cxt.measureText(text).width;
        cxt.fillStyle = color;
        //cxt.font="normal normal bold 60px 黑体";
        cxt.font=font;
        cxt.fillText(text,left,top);
        cxt.restore();
    }
}
