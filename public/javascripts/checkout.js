
function show1(){
    document.getElementById('pay').style.display ='none';
}
function show2(){
    document.getElementById('pay').style.display = 'block';
}

if($("input[name='Radio']:checked").val()==='a')
{
    console.log("yeahh!!");
    Stripe.setPublishableKey('pk_test_fBeLxHDvJLkK0dMf0YWuHNgD00gdx9fJFY');
    var $form = $('#checkout-form');

    $form.submit(function(event){
    $('#charge-error').addClass('d-none');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#ccnum').val(),
        cvc: $('#cvc').val(),
        exp_month: $('#expmonth').val(),
        exp_year: $('#expyear').val(),
        name: $('#cname').val()
    }, stripeResponseHandler);
    return false;
    });
    function stripeResponseHandler(status, response){
        if(response.error){
            $('#charge-error').text(response.error.message);
            $('#charge-error').removeClass('d-none');
            $form.find('button').prop('disabled', false);
        } else {
            var token = response.id;
            $form.append($('<input type="hidden" name="stripeToken" />').val(token));
            $form.get(0).submit();
        }
    }
}


/*var pay=document.querySelector("#pay");
$('input[type=radio]').click(function()
{
    if($('input[value=a]').prop("checked")) {
        pay.classList.remove("not_selected");

    }else if($('input[value=b]').prop("checked")){
        pay.classList.add("not_selected");
    }
});*/
