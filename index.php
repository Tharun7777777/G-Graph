<?php
include "config.php"
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-LN+7fdVzj6u52u30Kp6M/trliBMCMKTyK833zpbD+pXdCLuTusPj697FH4R/5mcr" crossorigin="anonymous">
    <title>My ChatBot</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="sidebar">
    <h2>GGraph</h2>
    <a href="index.php"> Dashboard</a>
    <a href="graph.html"> Graph</a>
    <a href="chat.html"> Chat</a>
  </div>

  <main>

 <header style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; ">

  <div>
    <h6 style="margin: 0;">Welcome Back, Name 👋</h6>
    <h1 style="margin: 0;">Dashboard</h1>
  </div>

  <div class="side-menu" style="display: flex; align-items: center; gap: 10px;">
    <h2 style="margin: 0;">hel</h2>
    <h4 style="margin: 0;">name</h4>
  </div>

</header>


  
    <form method="post">
    <div class="row">
      <div class="col-6">
               <div class=" card card1 row mb-2">
      <div class="col-6"><div class="row"><label style="color:black;"> yo vroo</label></div>
      <div class="row"><input type="number"  name="amount" placeholder="Amount Spent" required></div></div>
      <div class="col-6">
      <div class="row"><input type="text" name="purpose" placeholder="Purpose " required></div></div>
            <center><div class="col-12 pt-3"><button  type="submit" name="submit">Submit</button></div></center>
    </div>
      </div>
      <div class="col-6">
               <div class=" card card2 row mb-2">

               <div id="lineGraphContainer"></div>
      
    </div>
      </div>
    </div>
    <?php
    $sql = "SELECT id, amount, purpose,time FROM money ORDER BY time DESC";
    $result = $con->query($sql);
    ?>
    <div class="row">
      <div class="col-6">
               <div class=" card card-history row mb-2 ">
                 
                <div class="scroll-box">
                  <h5 class="card-title">Transaction History</h5>
                <?php 
                if($result->num_rows > 0)
                {
                  while($row=$result->fetch_assoc()){
   echo "
              <div class='transaction'>
                <div class='icon-box'>💰</div>
                <div class='details'>
                    <div class='purpose'>{$row['purpose']}</div>
                    <div class='time'>{$row['time']}</div>
                </div>
                <div class='amount'>₹{$row['amount']}</div>
              </div>
            ";                  }
                }else{
                  echo"<p>no transaction so far.</p>";
                }
                ?></div>
        </div>
      </div>
      <div class="col-6">
               <div class=" card row mb-2">

    </div>
    </div>
    </div>


    <div class="row">
      <div class="col-12">
        <div class=" card " style="margin-top: 70px; width: 1150px; height: 200px; justify-content: center; align-items: center; display: flex;">
        </div>
      </div>
    </div>
  

   
    </form>

     <?php 
  if(isset($_POST["submit"])){
    $amount=$_POST["amount"];
    $purpose=$_POST["purpose"];
    

    $sql="insert into money(id,amount,purpose,time) values(NULL,'$amount','$purpose',CURRENT_TIMESTAMP)";
   
    if($con->query($sql)){
echo "<script>Swal.fire('Done!', '', 'success');</script>";
    }
    else{
      echo "<script>Swal.fire('ERROR!', '', 'error');</script>";
    }
    
  }
  
  ?>
  <script src="graph.js?v=1.1"></script>
</body>
</html>