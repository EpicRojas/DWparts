$(".ft_tag").click(function(){
	//添加按下与未按下状态标记
	var nameVal = $(this).attr("name");
	//点击更改style状态
	if(nameVal == "off" || nameVal == null){
		//点击项处理为选中状态，非点击项取消选中状态
		$(this).siblings().attr("name","off");
		$(this).siblings().removeClass("ft_tag_on");
		$(this).attr("name","on");
		$(this).addClass("ft_tag_on");
	}else{
		return;//已选内容点击无效
	}
	//取被按下的class
	var ftclass="";
	$(".ft_tag[name='on']").each(function(){
		var idName = $(this).attr("id");
		if(idName != null){
			ftclass = ftclass + "." + $(this).attr("id") ;
		}
	});
	//显示被按下标签的内容
	if(ftclass != ""){
		$(".ft_list").hide();
		$(ftclass).show();
	}else{
		$(".ft_list").show();
	}
});
//判断所有项和默认选中项
if($(".ft_tag").html() != null){
	$(".ft_tag").each(function(){
		var idName = $(this).attr("id");
		if(idName == null){
			$(this).addClass("ft_tag_on");
		}
	});
	$(".ft_on").click();
}