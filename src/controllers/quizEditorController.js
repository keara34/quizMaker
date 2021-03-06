
(function (scope)
{
    //Editor Class
    function QuizEditor()
    {
    var that                 = this;
    that.container           = null;
    that.rightPanelContainer = null;
    that.selectedQuiz        = null;
    that.theme               = null;
    that.quizList            = [];
    that.quizTemplate        = null;


        if(QuizEditor.prototype.initializer === true) return;

        QuizEditor.prototype.initializer = true;

        QuizEditor.prototype.load = function(theme)
        {
            if(typeof(theme) !== undefined) {
                that.theme = theme;
                that.setQuizList(theme.quizzes);
                that.launch();
            }
        };

        QuizEditor.prototype.setQuizList = function(quizzes, cb) {
            var themeQuizzes = quizzes;
            var fileNames = [];
            for (var i = themeQuizzes.length - 1; i >= 0; i--) {
                fileNames.push(themeQuizzes[i].fileName);
            };
            that.quizList.Quizzes = [];
            that.quizList.Theme = that.theme;
            for (var i = fileNames.length - 1; i >= 0; i--) {
                var quiz = that.getQuiz(fileNames[i]);
                quiz.flag = false;
                that.quizList.Quizzes[quiz.Quiz.id] = quiz;
            };
        };
        QuizEditor.prototype.getQuiz = function(fileName) {
            var quiz;
                $.ajax({
                    type: 'GET',
                    url: 'data/'+fileName,
                    dataType: 'json',
                    async: false,
                    success: function(data){
                        quiz = data;
                    },
                    error: function(xhr, type){
                        console.log("error");
                    }
                });
            return quiz;
        }
        QuizEditor.prototype.launch = function() {
            that.container = $(".mainContainer");
            that.displayQuizList();
        };
        QuizEditor.prototype.hide = function() {
            that.container.addClass('hidden');
        }
        QuizEditor.prototype.show = function() {
            that.container.removeClass('hidden');
        }
        QuizEditor.prototype.displayQuizList = function() {
            that.render($('.editorContainer'), that.getEditorTemplate(), function() {
                that.rightPanelContainer = $(".editSection");
                that.setMainHandlers();
            });
        };
        QuizEditor.prototype.displayQuizContent = function(target)
        {
            that.render(that.rightPanelContainer, that.getRightPanelTemplate(), function() {
                that.setRightPanelHandlers();
            });
        };
        QuizEditor.prototype.render = function(target, data, cb)
        {
            target.html(data);
            if(typeof(cb) !== 'undefined') {
                cb();
            }
        };
        QuizEditor.prototype.orderQuizList = function() {
            for(key in that.quizList.Quizzes) {
                for (var i = that.quizList.Quizzes[key].Quiz.Questions.length - 1; i >= 0; i--) {
                    var props = that.quizList.Quizzes[key].Quiz.Questions[i].propositions.split(',');
                    for (var j = props.length - 1; j >= 0; j--) {
                        if(props[j] == that.quizList.Quizzes[key].Quiz.Questions[i].correctAnswer) {
                            props[j] = "*"+props[j];
                        }
                    };
                    that.quizList.Quizzes[key].Quiz.Questions[i].propositions = props.join(",");
                };
            };
        };
        QuizEditor.prototype.getEditorTemplate = function() {
            that.orderQuizList();
            var modelData = that.quizList;
            var htmlData;
            var template;
            var tempFunc;
            var html;

            $.ajax({
                type: 'GET',
                url: 'src/views/html/editorBox.html',
                dataType: 'html',
                async: false,
                cache: false,
                success: function(data){
                    template = data;
                    tempFunc = doT.template(template);
                    html = tempFunc(modelData);
                },
                error: function(xhr, type, data){
                    alert("error");
                }
            });
            return html;
        };
        QuizEditor.prototype.getRightPanelTemplate = function() {
            var modelData = that.selectedQuiz;
            var htmlData;
            var template;
            var tempFunc;
            var html;


            $.ajax({
                type: 'GET',
                url: 'src/views/html/editorRightPanel.html',
                dataType: 'html',
                async: false,
                cache: false,
                success: function(data){
                    template = data;
                    tempFunc = doT.template(template);
                    html = tempFunc(modelData);
                },
                error: function(xhr, type, data){
                    alert("error");
                }
            });
            return html
        };
        // TODO : PLACE IN UTILS
        QuizEditor.prototype.isObj = function(obj) {
            return obj === Object(obj);
        }
        QuizEditor.prototype.uId = function () {
            return Math.random().toString(36).substr(2, 9);
        };
        QuizEditor.prototype.saveQuizList = function()
        {
            var list = that.quizList.Quizzes;
            for (var i = list.length - 1; i >= 0; i--) {
                if(that.isObj(list[i]) && list[i].flag === false) {
                    that.saveFile(list[i]);
                }
            };
        }

        QuizEditor.prototype.setQuizTemplate = function(){
            $.ajax({
                type: 'GET',
                url: 'data/quizTemplate.json',
                dataType: 'json',
                async: false,
                success: function(data){
                    that.quizTemplate = data;
                },
                error: function(xhr, type){
                    console.log("error");
                }
            });
        }
        QuizEditor.prototype.getMaxQuizId = function(){
            return parseInt(that.quizList.Quizzes[that.quizList.Quizzes.length-1].Quiz.id) + 1;
        }
        QuizEditor.prototype.focus = function(quizId){

        }
        QuizEditor.prototype.createNewQuiz = function(){

            if(that.quizTemplate === null) {
                that.setQuizTemplate();
            }

            var fileId = that.uId();
            var filename = "quiz_"+fileId+".json";
            var path = "../data/"+filename;
            var data = that.quizTemplate;
            var quizId = that.getMaxQuizId();
            data.Quiz.id = quizId;

            if(that.saveFile(data, path) && that.editTheme(quizId, filename)) {
                that.updateList(data);
            }
        }
        QuizEditor.prototype.editTheme = function() {
            if(arguments.length > 1) {
                var quizId = arguments[0];
                var quizFileName = arguments[1];

                var newQuiz = {"id":quizId,
                               "fileName":quizFileName};
                that.theme.quizzes.push(newQuiz);
            }
            else {
                var id = arguments[0];
                var themeQuizzes = that.theme.quizzes;
                var newQuizTab;
                for (var i = themeQuizzes.length - 1; i >= 0; i--) {
                    if(themeQuizzes[i].id === id) {
                        that.theme.quizzes.indexOf(i, 1);
                    }
                };
            }
            return that.saveTheme();
        }
        QuizEditor.prototype.saveTheme = function() {
            return that.saveFile(that.theme, that.theme.path);
        }
        QuizEditor.prototype.updateList = function(quiz)
        {
            // TODO REFACTOR CODE
            console.log(quiz);
            var container = $('.quizListPanel');
            // that.render();
        }
        QuizEditor.prototype.saveFile = function(data, filePath)
        {
            var reqData = {"reqtype" : "save",
                        "data" : data,
                        "path" : filePath};
            var isSuccessful = false;
            $.ajax({
                type: 'POST',
                url: 'server/app.php',
                data: reqData,
                async: false,
                success: function(resp){
                    isSuccessful = resp != 0 ? true : false;
                },
                error: function(xhr, type, data){
                    console.log(xhr);
                    alert("error");
                }
            });
            return isSuccessful;
            // TODO HANDLE AJAX ERRORS
        };
        QuizEditor.prototype.setRightPanelHandlers = function()
        {
            // DElETE QUESTION
        };
        QuizEditor.prototype.setMainHandlers = function()
        {
            Core.subscribe('SAVE_ALL_DATA', function() {
               console.log('SAVE_ALL_DATA');
               that.saveQuizList();
            });
            $('.quizListItem').click(function(event) {
                // TODO : FOCUS METHOD
                // get appended element in list and addclass 'selected'
                $('.removeSelectedQuiz').removeClass('disabled');
                $('.quizListItem').removeClass('selected');
                $(this).addClass('selected');
                var quizId = $(this).children('.quiz').children('.quizLink').attr('data-quiz-id');
                that.selectedQuiz = that.quizList.Quizzes[quizId];
                that.displayQuizContent(that.rightPanelContainer);
            });
            $('.backToThemesButton').click(function(event) {
                Core.go('Dashboard');
                Core.publish('SAVE_ALL_DATA');
            });
            $('.addQuiz').click(function(event) {
                if(that.createNewQuiz()) {
                    that.updateList();
                }
            });
        };
        QuizEditor.prototype.unsetHandlers = function()
        {

        };
        QuizEditor.prototype.destroy = function()
        {
            that.unsetHandlers();
            $('.editorContainer').empty();
            that.hide();
        };
    }

    scope.Editor = new QuizEditor();

})(window);

Core.register('QuizEditor', function(quiz)
{
    Editor.load(quiz);
    return Editor;
});