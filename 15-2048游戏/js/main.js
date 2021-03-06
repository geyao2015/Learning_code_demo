/**
 * Created by 岳 on 2015/3/10.
 */

var board = new Array(),
    score = 0,
    hasConflicted = new Array();//用于防止二次碰撞

var startx, starty, endx, endy;//用于移动端触控操作

screenWidth = $(window).width();
gridContainerWidth = screenWidth * 0.92;
cellWidth = screenWidth * 0.18;
cellDistance = screenWidth * 0.04;
$(function () {
    newGame();
});

function newGame() {
    adjustForMobile();
    //初始化
    init();
}
function adjustForMobile() {
    //调整grid以根据适应移动端；
    if (screenWidth >= 500) {
        //适用于网页
        gridContainerWidth = 500;
        cellWidth = 100;
        cellDistance = 20;
    }
    //调整header部分样式
    $(".header").css("width", gridContainerWidth + "px");
    $(".header").css("left", cellWidth * 3 + "px");
    $(".header h2").css("margin-left", -(gridContainerWidth / 2 - cellDistance) + "px");

    //调整grid-container
    var theGridContainer = $("#grid-container");
    theGridContainer.css({
        "width": gridContainerWidth + "px",
        "height": gridContainerWidth + "px",
        "border-radius": gridContainerWidth * 0.02 + "px"
    });

    //调整grid-cell
    $(".grid-cell").css({
        "height": cellWidth + "px",
        "width": cellWidth + "px",
        "border-radius": gridContainerWidth * 0.02 + "px"
    });

    //调整遮罩层
    var mask = $(".overMask");
    mask.css({
        "width": gridContainerWidth,
        "height": gridContainerWidth,
        "border-radius": gridContainerWidth * 0.02 + "px",
        "margin-top": -(gridContainerWidth + 15),
        "margin-left": (screenWidth - gridContainerWidth) / 2
    });
    $(".overMask a").css({
        "height": "50px",
        "line-height": "50px"
    });


}
function init() {
    //初始化函数
    score = 0;
    updateScore();
    $(".overMask").hide();

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $("#grid-cell-" + i + "-" + j).css("top", getPosTop(i, j));
            $("#grid-cell-" + i + "-" + j).css("left", getPosLeft(i, j));
        }

    }
    //初始化board数据
    for (var i = 0; i < 4; i++) {
        board[i] = new Array();
        hasConflicted[i] = new Array();
        for (var j = 0; j < 4; j++) {
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }
    generateOneNumber();
    generateOneNumber();

    updateBoardView();

}

function updateBoardView() {
    //更新页面视图-即根据board生成所有 number-cell
    $(".number-cell").remove();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $("#grid-container").append('<div class="number-cell" id="number-cell-' + i + '-' + j + '"></div>');
            var theNumberCell = $("#number-cell-" + i + "-" + j);//表示当前正在操作的cell

            if (board[i][j] == 0) {
                //此时不显示数字
                theNumberCell.css("width", 0);
                theNumberCell.css("height", 0);
                theNumberCell.css("top", getPosTop(i, j) + cellWidth / 2);
                theNumberCell.css("left", getPosLeft(i, j) + cellWidth / 2);

            }
            else {
                theNumberCell.css({
                    "width": cellWidth + "px",
                    "height": cellWidth + "px",
                    "line-height": cellWidth + "px",
                    "border-radius": gridContainerWidth * 0.02 + "px",
                    "top": getPosTop(i, j),
                    "left": getPosLeft(i, j),
                    "background-color": getNumberBackgroundColor(board[i][j]),
                    "color": getNumberColor(board[i][j]),
                    "font-size": cellWidth * 0.65 + "px"
                });
                theNumberCell.html(board[i][j]);
                if (board[i][j] >= 128) {
                    theNumberCell.css("font-size", cellWidth * 0.5);
                }
            }
            hasConflicted[i][j] = false;
        }
    }
}

function generateOneNumber() {
    //随机的在一个位置生成2或者4
    if (!nospace(board)) {
        //随机一个位置
        var randx = parseInt(Math.floor(Math.random() * 4));//向下取整
        var randy = parseInt(Math.floor(Math.random() * 4));
        var count = 0;
        while (count < 40) {
            //只循环40次，避免计算机一直找不到而循环
            if (board[randx][randy] == 0) {
                break;
            }
            randx = parseInt(Math.floor(Math.random() * 4));
            randy = parseInt(Math.floor(Math.random() * 4));
        }
        if (count == 39) {
            //查找一个空位置
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    if (board[i][j] == 0) {
                        randx = i;
                        randy = j;
                    }
                }
            }
        }
        //随机2或4
        var randNumber = Math.random() < 0.6 ? 2 : 4;

        //在随机位置显示随机数字
        board[randx][randy] = randNumber;

        showNumberWithAnimation(randx, randy, randNumber);
    }
    return true;
}

function isGameOver() {
    if (nospace(board) && noMove(board)) {
        gameOver("Just Try Again!")
    }
}

function gameOver(text) {
    generateOneNumber();
    $(".overMask a").html(text);
    //$(".overMask").css("display", "block");
    $(".overMask").show();
}

function isWinGame(board) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] == 2048) {
                return true;
            }
        }
    }
    return false;
}

//移动度端触控操作
document.addEventListener("touchstart", function (event) {
    startx = event.touches[0].clientX;
    starty = event.touches[0].clientY;
});
document.addEventListener("touchend", function (event) {
    endx = event.changedTouches[0].pageX;
    endy = event.changedTouches[0].pageY;

    if (Math.abs(endx - startx) > 0.1 * screenWidth || Math.abs(endy - starty) > 0.1 * screenWidth) {
        if (Math.abs(endx - startx) > Math.abs(endy - starty)) {
            //横向
            if (endx - startx > 0) {
                //moveRight
                if (moveRight()) {
                    setTimeout(generateOneNumber(), 210);
                    setTimeout(isGameOver(), 220);
                }
            }
            else {
                //moveLeft
                if (moveLeft()) {
                    setTimeout(generateOneNumber(), 210);
                    setTimeout(isGameOver(), 220);
                }
            }
        }
        else {
            //纵向
            if (endy - starty > 0) {
                //moveDown
                if (moveDown()) {
                    setTimeout(generateOneNumber(), 210);
                    setTimeout(isGameOver(), 220);
                }
            }
            else {
                //moveUp
                if (moveUp()) {
                    setTimeout(generateOneNumber(), 210);
                    setTimeout(isGameOver(), 220);
                }
            }
        }
    }
});

//键盘操作
$(document).keydown(function (event) {
    switch (event.keyCode) {
        case 37://left
            event.preventDefault();//阻止默认的方向键，避免滚动条出现
            if (moveLeft()) {
                setTimeout(generateOneNumber(), 220);
                setTimeout(isGameOver(), 220);
            }
            break;
        case 38://up
            event.preventDefault();
            if (moveUp()) {
                setTimeout(generateOneNumber(), 210);
                setTimeout(isGameOver(), 220);
            }
            break;
        case 39://right
            event.preventDefault();
            if (moveRight()) {
                setTimeout(generateOneNumber(), 210);
                setTimeout(isGameOver(), 220);
            }
            break;
        case 40://down
            event.preventDefault();
            if (moveDown()) {
                setTimeout(generateOneNumber(), 210);
                setTimeout(isGameOver(), 220);
            }
            break;
        default :
    }
});

function moveLeft() {
    if (!canMoveLeft(board)) {
        generateOneNumber();
        return false;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, k, j, board)) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    if (board[i][k] == board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        updateScore();
                        if (isWinGame(board)) {
                            gameOver("You Get 2048!");
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(updateBoardView(), 210);
    return true;
}

function moveUp() {
    if (!canMoveUp(board)) {
        generateOneNumber();
        return false;
    }
    for (var j = 0; j < 4; j++) {
        for (var i = 1; i < 4; i++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] == 0 && noBlockVertical(k, i, j, board)) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    if (board[k][j] == board[i][j] && noBlockVertical(k, i, j, board) && !hasConflicted[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        updateScore();
                        if (isWinGame(board)) {
                            gameOver("You Get 2048!");
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(updateBoardView(), 220);
    return true;
}
function moveRight() {
    if (!canMoveRight(board)) {
        generateOneNumber();
        return false;
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, j, k, board)) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    if (board[i][k] == board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        updateScore();
                        if (isWinGame(board)) {
                            gameOver("You Get 2048!");
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(updateBoardView(), 500);
    return true;
}
function moveDown() {
    if (!canMoveDown(board)) {
        generateOneNumber();
        return false;
    }
    for (var j = 0; j < 4; j++) {
        for (var i = 2; i >= 0; i--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] == 0 && noBlockVertical(i, k, j, board)) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    if (board[k][j] == board[i][j] && noBlockVertical(i, k, j, board) && !hasConflicted[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        updateScore();
                        if (isWinGame(board)) {
                            gameOver("You Get 2048!");
                        }
                        continue;
                    }
                }
            }
        }
    }
    setTimeout(updateBoardView(), 220);
    return true;
}
function updateScore() {
    //更新分数
    $("#score").html(score);
}