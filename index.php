<!DOCTYPE html>
<html lang="en">

<head>
  
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0">
  	<link rel="icon" href="../src/icon.png">
  	<script src="./three.js" type="module"></script>
  	<script src="https://cdn.jsdelivr.net/npm/geolib@3.3.1/lib/index.js"></script>
	<!--<link type="text/css" rel="stylesheet" href="main.css">-->
    <title>Open Street Map 3D</title>
  
    <!-- BEGIN VENDOR CSS-->
    <!-- font icons-->
    <link rel="stylesheet" type="text/css" href="./assets/fonts/feather/style.min.css">
    <link rel="stylesheet" type="text/css" href="./assets/fonts/simple-line-icons/style.css">
    <link rel="stylesheet" type="text/css" href="./assets/fonts/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="./assets/vendors/css/perfect-scrollbar.min.css">
    <link rel="stylesheet" type="text/css" href="./assets/vendors/css/prism.min.css">
    <link rel="stylesheet" type="text/css" href="./assets/vendors/css/switchery.min.css">
    <link rel="stylesheet" type="text/css" href="./assets/vendors/css/chartist.min.css">
    <link rel="stylesheet" type="text/css" href="./assets/vendors/css/nouislider.min.css">
    <!-- END VENDOR CSS-->
    <!-- BEGIN APEX CSS-->
    <link rel="stylesheet" type="text/css" href="./assets/css/bootstrap.css">
    <link rel="stylesheet" type="text/css" href="./assets/css/bootstrap-extended.css">
    <link rel="stylesheet" type="text/css" href="./assets/css/colors.css">
    <link rel="stylesheet" type="text/css" href="./assets/css/components.css">
    <link rel="stylesheet" type="text/css" href="./assets/css/themes/layout-dark.css">
    <link rel="stylesheet" href="./assets/css/plugins/switchery.css">
    <!-- END APEX CSS-->
    <!-- BEGIN Page Level CSS-->
    <link rel="stylesheet" type="text/css" href="./assets/css/core/menu/horizontal-menu.css">
    <link rel="stylesheet" type="text/css" href="./assets/css/pages/dashboard1.css">
    <link rel="stylesheet" href="./assets/css/pages/ex-component-nouislider.css">
    <!-- END Page Level CSS-->
    <!-- BEGIN: Custom CSS-->
    <link rel="stylesheet" type="text/css" href="./assets/css/style.css">
    <!-- END: Custom CSS-->
  
</head>

<body class="horizontal-menu horizontal-menu-padding 2-columns layout-dark">
  
  	<!-- Navbar (Header) Begin-->
    <nav class="navbar navbar-expand-lg navbar-light header-navbar">
        <div class="container-fluid navbar-wrapper">
            <div class="navbar-header d-flex">
                
                <ul class="navbar-nav">
                    <li class="nav-item mr-2 d-none d-lg-block"><a class="nav-link apptogglefullscreen" id="navbar-fullscreen" href="javascript:;"><i class="ft-maximize font-medium-3"></i></a></li>
                </ul>
              
            </div>
            <div class="navbar-container">
                <div class="collapse navbar-collapse d-block" id="navbarSupportedContent">
                    <ul class="navbar-nav">
                        <li class="i18n-dropdown dropdown nav-item mr-2"><a class="nav-link d-flex align-items-center dropdown-toggle dropdown-language" id="dropdown-flag" href="javascript:;" data-toggle="dropdown"><img class="langimg selected-flag" src="./assets/img/flags/us.png" alt="flag"><span class="selected-language d-md-flex d-none">English</span></a>
                            <div class="dropdown-menu dropdown-menu-right text-left" aria-labelledby="dropdown-flag"><a class="dropdown-item" href="javascript:;" data-language="en"><img class="langimg mr-2" src="./assets/img/flags/us.png" alt="flag"><span class="font-small-3">English</span></a></div>
                        </li>
                        <li class="nav-item d-none d-lg-block mr-2 mt-1"><a class="nav-link notification-sidebar-toggle" href="javascript:;"><i class="ft-align-right font-medium-3"></i></a></li>
                    </ul>
                </div>
            </div>
        </div>
    </nav>
    <!-- Navbar (Header) Ends-->



    <!-- Main Body Begin-->
    <div class="wrapper">

      <div class="content">

      <div class="widget-container" style="left: 2%;">
        <div class="arrow" id="arrow" onclick="toggleWidget('arrow', 'widget')"></div>
        <div class="widget" id="widget">
          <div class="left-menu">
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">Basic</h4>
              </div>
              <div class="card-content">
                <div class="card-body"><div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-1" checked>
                    <label class="custom-control-label mr-1" for="custom-switch-1">
                      <span>Animation</span>
                    </label>
                  </div></div>
                  <div class="form-group" style="margin-top:15px;">
                    <snap>Building transparent</snap>
                    <div id="snap" class="my-1"></div>
                  </div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0" style="margin-top:15px;">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-3" disabled>
                    <label class="custom-control-label mr-1" for="custom-switch-3">
                      <span>2D Map</span>
                    </label>
                  </div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0" style="margin-top:15px;">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-4">
                    <label class="custom-control-label mr-1" for="custom-switch-4">
                      <span>DOF</span>
                    </label>
                  </div>
                  <div class="combobox-container" style="margin-top:15px;">
                    <snap>Location:<br></snap>
                    <select id="combobox1" name="locations" disabled>
                      <option value="losangeles">Los Angeles</option>
                      <option value="paris">Paris</option>
                    </select>
                  </div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0" style="margin-top:15px;">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-5" checked>
                    <label class="custom-control-label mr-1" for="custom-switch-5">
                      <span>Rendered Mode</span>
                    </label>
                  </div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0" style="margin-top:15px;">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-6" checked>
                    <label class="custom-control-label mr-1" for="custom-switch-6">
                      <span>Rendered Water</span>
                    </label>
                  </div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0" style="margin-top:15px;">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-7" checked>
                    <label class="custom-control-label mr-1" for="custom-switch-7">
                      <span>Trees</span>
                    </label>
                  </div>
                  <div class="custom-switch custom-control-inline mb-1 mb-xl-0" style="margin-top:15px;">
                    <input type="checkbox" class="custom-control-input" id="custom-switch-8" checked>
                    <label class="custom-control-label mr-1" for="custom-switch-8">
                      <span>Terrain</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div class="main">          
          <div id="threejs-container">
            <div id="info">info</div>
            <!-- Info-->
          </div>
        </div>

        <div class="right-menu"> 
          <div class="card" style="height: 100%;">
              <div class="card-header">
                  <h6 style="margin-bottom: 10px">X</h6>
              </div>
              <div class="card-content" style="height: 100%;">
                  <fieldset style="height: 100%;">
                      <div class="form-group" style="height: 100%;">
                          <div id="pips-range-camX" class="ml-3 mr-3 noUi-info" style="height: 95%;"></div>
                      </div>
                  </fieldset>
              </div>
          </div>
        </div>
        
      </div>

      <div class="content" style="padding-top: 0 !important;">

        <div class="footer">
          <div class="card">
            <div class="card-body">
                <h6>Rotation Y</h6>
                <div class="form-group">
                    <div id="pips-range-camY"></div>
                </div>
            </div>
          </div>
        </div>
        
      </div>
      

    </div>
    <!-- Main Body End-->
  

    <!-- THREE JS-->
    <script src="three.js" type="module"></script>

    <!-- END Notification Sidebar-->
    <div class="sidenav-overlay"></div>
    <div class="drag-target"></div>
    <!-- BEGIN VENDOR JS-->
    <script src="./assets/vendors/js/vendors.min.js"></script>
    <script src="./assets/vendors/js/switchery.min.js"></script>
    <!-- BEGIN VENDOR JS-->
    <!-- BEGIN PAGE VENDOR JS-->
    <script src="./assets/vendors/js/wNumb.js"></script>
    <script src="./assets/vendors/js/nouislider.min.js"></script>
    <!-- END PAGE VENDOR JS-->
    <!-- BEGIN APEX JS-->
    <script src="./assets/js/core/app-menu.js"></script>
    <script src="./assets/js/core/app.js"></script>
    <script src="./assets/js/notification-sidebar.js"></script>
    <script src="./assets/js/customizer.js"></script>
    <script src="./assets/js/scroll-top.js"></script>
    <!-- END APEX JS-->
    <!-- BEGIN: Custom CSS-->
    <script src="./assets/js/scripts.js"></script>
    <!-- END: Custom CSS-->
  
  	<script src="https://cdn.jsdelivr.net/npm/geotiff"></script>
  
</body>
</html>
