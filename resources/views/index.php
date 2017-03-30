<!-- resources/views/index.php -->

<!doctype html>
<html ng-app="gorillaApp">
    <head>
        <meta charset="utf-8">
        <title>{{ appName }}</title>
        <link rel="stylesheet" href="css/app.css">
    </head>
    <body id="main-body">

        <header>
            <ng-include ng-if="state.current.name !== 'auth'" src="'views/include/logout.html'"></ng-include>
        </header>

        <div class="container">
            <div ui-view></div>
            <p class="made-with text-center">
                Made with <span class="glyphicon glyphicon-heart"></span> by Abdullah
            </p>
        </div>        

    </body>

     <!--Application Dependencies 
    <script src="node_modules/angular/angular.js"></script>
    <script src="node_modules/angular-ui-router/build/angular-ui-router.js"></script>
    <script src="node_modules/satellizer/satellizer.js"></script>-->

    <!-- Application Scripts -->
    <script src="js/app.js"></script>
</html>