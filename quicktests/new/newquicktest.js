var plottableBranches=[];
var qtestnames = [];
var firstBranch;
var secondBranch;
var first = true; //boolean to set order
var newWidth = Number($("#width").val());
var newHeight = Number($("#height").val());


function initialize(){
  var branches = [];
  var dropdown = $("#category")[0];
  var category = dropdown.options[dropdown.selectedIndex].value;

  firstBranch = $("#branch1").val();
  secondBranch = $("#branch2").val();
  newWidth = Number($("#width").val());
  newHeight = Number($("#height").val());

  branches.push(firstBranch, secondBranch);
  clearTests();

  loadPlottableBranches(category, branches);
}

function filterQuickTests(category, branchList){
  //filter list of quicktests to list of quicktest names to pass to doSomething
  d3.json("list_of_quicktests.json", function (data){
    data.forEach(function(quicktestobj){
      var path = quicktestobj.path;

      if (-1 !== path.indexOf("list/" + category)){
        var name = path.replace(/.*\/|\.js/g, '');
        //quickTestNames.push(name);
        qtestnames.push(name)
      }

    });
    loadQuickTestsInCategory(qtestnames, category, branchList[0], branchList[1]);
  });
}

function loadQuickTestsInCategory(quickTestNames, category, firstBranch, secondBranch){
  //x here is an array of test names

  var div = d3.select("#results");
  quickTestNames.forEach(function(q) { //for each quicktest 
    var name = q;
    d3.text("/quicktests/new/list/" + category + "/" + name + ".js", function(error, text) {
      if (error !== null) {
        console.warn("Tried to load nonexistant quicktest " + name);
        return;
      }
      var x = new Function(text);
      text = "(function(){" + text +
          "\nreturn {makeData: makeData, run: run};" +
               "})();" +
          "\n////# sourceURL=" + name + ".js\n";
      result = eval(text);
      var className = "quicktest " + name;

      var div = d3.select("#results").append("div").attr("class", className).attr("width", newWidth).attr("height", newHeight);;
      var firstdiv = div.append("div").attr("class", "first");
      var seconddiv = div.append("div").attr("class", "second");
      var data = result.makeData();

        runQuickTest(firstdiv, data, firstBranch);
        runQuickTest(seconddiv, data, secondBranch);
    });
  });//forEach
    
} //loadQuickTestCategory

//METHODS

function loadPlottableBranches(category, branchList){
  var listOfUrl = [];
  var branchName1 = branchList[0];
  var branchName2 = branchList[1];

  if (plottableBranches[branchName1] != null  && plottableBranches[branchName2] != null ) {
    return;
  }

  branchList.forEach(function(branch){
    if (branch !== "#local") {
      listOfUrl.push("https://rawgit.com/palantir/plottable/" + branch + "/plottable.js");
    } else {
      listOfUrl.push("/plottable.js"); //load local version
    }

  })

  $.getScript(listOfUrl[0], function(data, textStatus) { 
    if(textStatus === "success"){
          console.log("success!");
          console.log("Plottable version: " + Plottable.version);
      plottableBranches[branchName1] =  $.extend(true, {}, Plottable);
      Plottable = null;

      $.getScript(listOfUrl[1], function(data, testStatus){ //load second 
        if(textStatus === "success"){
          console.log("success!");
          console.log("Plottable version: " + Plottable.version);

          plottableBranches[branchName2] = $.extend(true, {}, Plottable);
          Plottable = null;
          filterQuickTests(category, branchList);
        }
      });
    }
    if(textStatus === "error"){
      console.log("errored!")
    }

  });
}

//run a single quicktest
function runQuickTest(div, data, branch){
  try {
    result.run(div, data, plottableBranches[branch])
  } catch (err) {
    setTimeout(function() {throw err;}, 0);
  }
};

function clearTests(){
  plottableBranches = [];
  qtestnames= [];
  resetDisplayProperties();
  d3.selectAll(".quicktest").remove();
}

function resetDisplayProperties(){
  $(".first, .first svg").css("display", "block");
  $(".second, .second svg").css("display", "block");
  $("#branch1").css("background-color", "white");
  $("#branch2").css("background-color", "white");
}

window.onkeyup = function(e){
  var key = e.keyCode ? e.keyCode : e.which;

  var visibleQuickTests = $(".quicktest").toArray();

  if(key == 49){
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "block");
      $(".second", quicktest).css("display", "none");
      $(".second", quicktest).before($(".first", quicktest));
    });

    $("#branch1").css("background-color", "mediumaquamarine");
    $("#branch2").css("background-color", "white");
    
    return;
  }
  //if 2 is pressed
  if(key == 50){
    //$(".quicktest").css("display", "inline-block")
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "none");
      $(".second", quicktest).css("display", "block");
      $(".first", quicktest).before($(".second", quicktest));
    });

    $("#branch1").css("background-color", "white");
    $("#branch2").css("background-color", "mediumaquamarine");
    
    return;
  }
  //if 3 is pressed
  if(key == 51){
    //$(".quicktest").css("display", "inline-block")
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "block");
      $(".second", quicktest).css("display", "block");
      $(".first", quicktest).before($(".second", quicktest));
    });
    $("#branch1").css("background-color", "mediumaquamarine");
    $("#branch2").css("background-color", "mediumaquamarine");
    return;
  }
  //if 4 is pressed
  if(key == 52){
    //$(".quicktest").css("display", "none")
    visibleQuickTests.forEach(function(quicktest){
      $(".first", quicktest).css("display", "none");
      $(".second", quicktest).css("display", "none");
      $(".first", quicktest).before($(".second", quicktest));
    });
    $("#branch1").css("background-color", "white");
    $("#branch2").css("background-color", "white");
    return;
  }
}

function showSizeControls(){
  var buttonstatus = $("#expand").val()
  if (buttonstatus == "+"){
    $( ".size-controls" ).slideDown( 300, function() {
      $(this).focus();
      $("#expand").val("-");
    }); 
  }
  else{
    $( ".size-controls" ).slideUp( 300, function() {
      $("#expand").val("+");
    });
  }
}





