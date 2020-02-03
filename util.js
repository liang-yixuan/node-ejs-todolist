
exports.getDate = function(){
  let today = new Date();
  // 用tolacaledatestring来生成日期信息，“en-US”可以改成其他地区
  let options = {
    weekday : "long",
    day : "numeric",
    month : "long"
  };
  return today.toLocaleDateString("en-US", options);
};

exports.getDay = function(){
  let today = new Date();
  // 用tolacaledatestring来生成日期信息，“en-US”可以改成其他地区
  let options = {
    weekday : "long"
  };
  return today.toLocaleDateString("en-US", options);
};
