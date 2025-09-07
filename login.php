<?php
include "config.php";
session_start();
    if (isset($_SESSION["fullname"]))
    {
        header("Location:main.php");
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7" crossorigin="anonymous">
    <link rel="stylesheet" href="loginstyle.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert/2.1.2/sweetalert.min.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div class="container">
        <div class="row gx-5">
            <div class="col-4 left-panel ">
                <center>
                <form class="pt-5" method="post" enctype="multipart/form-data">
                <div class="row ps-3 pb-2 "><h4 class="text-success">draft</h4></div>
                <div class="row ps-3 py-2">
                    <h2>draft</h2>
                </div>
                <br>
                <div class="pt-5">
                <div class="row p-4 ps-5">
                    
                    <input type="text" name ="fullname" required placeholder="Full Name">
                </div>
               
                <div class="row p-4 ps-5">
                    
                    <input type="password" name ="password" required placeholder="password">
                </div></div>
                
                <div class="pt-1">
                <div class="row p-4  ps-5">
                    <button type="submit" name ="login" >Login</button>
                </div>
                <div class="row ps-4  ">
                    <p>Already have an account? <a  href="create.php">Create</a></p>
                </div></div>
            </div></form>
<?php 

if(isset($_POST["login"]))
        {
        $fullname=$_POST["fullname"];
        $password1=$_POST["password"];
        $password=md5($password1);
        $sql="SELECT * FROM account WHERE fullname='$fullname' AND hash='$password' ";
        $res=$con->query($sql);
        if($row=$res->fetch_assoc())
        {
        $_SESSION["fullname"]=$row["fullname"];
        echo "<script>window.open('index.php','_self');</script>";
        }
        else 
        {
        echo "<script>swal('Invalid Login Credentials');</script>";
        }
        }
?>





        
        
        
        
        
        
        </center>
 
            <div class="col-8 right-panel"><img src="login1.png" width="591" height="607" alt=""></div>
        </div>
    </div>








</body>
</html>'