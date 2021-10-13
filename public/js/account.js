$(document).ready(function() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    let qntYears = 60;
    let selectYear = $("#year");
    let selectMonth = $("#month");
    let selectDay = $("#day");
    let currentYear = new Date().getFullYear();
  
    for (var y = 0; y < qntYears; y++) {
      let date = new Date(currentYear);
      let yearElem = document.createElement("option");
      yearElem.value = currentYear
      yearElem.textContent = currentYear;
      selectYear.append(yearElem);
      currentYear--;
    }
  
    for (var m = 0; m < 12; m++) {
      let month = monthNames[m];
      let monthElem = document.createElement("option");
      monthElem.value = m;
      monthElem.textContent = month;
      selectMonth.append(monthElem);
    }
  
    var d = new Date();
    var month = d.getMonth();
    var year = d.getFullYear();
    var day = d.getDate();
  
    selectYear.val(year);
    // selectYear.on("change", AdjustDays);
    selectMonth.val(month);
    // selectMonth.on("change", AdjustDays);
  
    AdjustDays();
    selectDay.val(day)
  
    function AdjustDays() {
      var year = selectYear.val();
      var month = parseInt(selectMonth.val()) + 1;
      selectDay.empty();
  
      //get the last day, so the number of days in that month
      var days = new Date(year, month, 0).getDate();
  
      //lets create the days of that month
      for (var d = 1; d <= days; d++) {
        var dayElem = document.createElement("option");
        dayElem.value = d;
        dayElem.textContent = d;
        selectDay.append(dayElem);
      }
    }

    //show change pass info
    $('.changePass').click(() => {
    if ($('.changePass').is(':checked') == true){
        $('#showChangePass').prop('checked', true)
    } else {
        $('#showChangePass').prop('checked', false)
    }
    });

    // change active account_action item
    var accountActionItems = document.querySelectorAll('.account-action__item');
    var acountRights = document.querySelectorAll('.account-right');
    accountActionItems[0].classList.add('active');
    acountRights[0].classList.add('active')
    accountActionItems.forEach((accountActionItem, index) => {
        accountActionItem.addEventListener('click', () => {
            removeActiveAction();
            accountActionItem.classList.add('active')
            acountRights[index].classList.add('active')
        })
    })

    //remove active account_action item 
    function removeActiveAction(){
        accountActionItems.forEach(accountActionItem => {
            accountActionItem.classList.remove('active');
        })
        acountRights.forEach(acountRight => {
            acountRight.classList.remove('active');
        })
    }

    //disable submit button
    $("form :input").change(function() {
        $(this).closest('form').data('changed', true);
        $('.btn-submit').prop('disabled', false)
      });
    $('.btn-submit').click(function() {
        if($(this).closest('form').data('changed')) {
            var oldPassword = $('input[name="oldPassword"]').val()
            var newPassword = $('input[name="newPassword"]').val()
            var passwordConfirm = $('input[name="passwordConfirm"]').val()
            if(oldPassword == "" && newPassword == "" && passwordConfirm ==""){
                $('input[type="password"]').prop('required', false);
            }
        }
    });

    $('.btn-submit').prop('disabled', true)

    // localStorage
    localStorage.setItem('user','61532940017c30975a50d4f9');
    const accountID = localStorage.getItem('user');
    $.ajax()
    const accountName =
    $('.account-avatar__info-name').text();
    
});


  