document.addEventListener("DOMContentLoaded", async function () {
    let username;
    let balance;
    let points = 1000;

    let authorizationForm = document.getElementById("authorization");
    if (authorizationForm) {
        authorizationForm.addEventListener("submit", authorization);
    }

    document.querySelector('.exit')?.addEventListener("click", exit);

    let gameButton = document.getElementById("gameButton");
    if (gameButton) {
        gameButton.addEventListener("click", startOrStopGame);
    }

    let pointBtns = document.getElementsByName("point");
    pointBtns.forEach((elem) => {
        elem.addEventListener('input', setPoints);
    });

    await checkUser();

    async function sendRequest(url, method, data = {}) {
        url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`;
        try {
            let options = {
                method,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            };
            if (method === "POST") {
                options.body = JSON.stringify(data);
            } else if (method === "GET") {
                url += "?" + new URLSearchParams(data).toString();
            }

            let response = await fetch(url, options);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error("Fetch error: ", error);
            alert("There was an error with the request. Please try again later.");
            return { error: true, message: error.message };
        }
    }

    async function authorization(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        username = formData.get('username');
        let response = await sendRequest("user", "GET", { username });

        if (response.error) {
            let regResponse = await sendRequest("user", "POST", { username });
            if (regResponse.error) {
                alert(regResponse.message);
            } else {
                balance = regResponse.balance;
                showUser();
            }
        } else {
            balance = response.balance;
            showUser();
        }
    }

    function showUser() {
        let popUpSection = document.querySelector('section');
        popUpSection.style.display = "none";
        let userInfo = document.querySelector("header span");
        userInfo.innerHTML = `[${username}, ${balance}]`;
        localStorage.setItem("username", username);

        if (localStorage.getItem("game_id")) {
            gameButton.setAttribute("data-game", "stop");
        } else {
            gameButton.setAttribute("data-game", "start");
        }
    }

    function exit() {
        let popUpSection = document.querySelector('section');
        popUpSection.style.display = "flex";
        let userInfo = document.querySelector("header span");
        userInfo.innerHTML = `[]`;
        localStorage.removeItem("username");
    }

    async function checkUser() {
        if (localStorage.getItem("username")) {
            username = localStorage.getItem("username");
            let response = await sendRequest("user", "GET", { username });
            if (response.error) {
                alert(response.message);
            } else {
                balance = response.balance;
                showUser();
            }
        } else {
            let popUpSection = document.querySelector('section');
            popUpSection.style.display = "flex";
        }
    }

    function setPoints() {
        let checkedBtn = document.querySelector("input:checked");
        points = +checkedBtn.value;
    }

    function startOrStopGame() {
        let option = gameButton.getAttribute("data-game");
        if (option === "start") {
            if (points > 0) {
                startGame();
            }
        } else if (option === "stop") {
            // Add stop game logic here if needed
        }
    }

    async function startGame() {
        let response = await sendRequest("new_game", "POST", { username, points });
        if (response.error) {
            alert(response.message);
        } else {
            console.log(response);
        }
    }
});

