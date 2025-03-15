document.addEventListener("DOMContentLoaded", function () {
    let textElement = document.getElementById("rollingText");

    textElement.addEventListener("animationend", function () {
        setTimeout(() => {
            textElement.innerText = "Hello!";
            textElement.style.color = "green";
            textElement.style.fontSize = "50px";
            
            setTimeout(() => {
                textElement.innerText = "This is a personal website for practicing.";  
                textElement.style.color = "rgb(112, 84, 214)";  
                textElement.style.fontSize = "30px";
            }, 3000); 
        }, 4000); 
    });
});


