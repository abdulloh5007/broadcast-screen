let wrapper = document.querySelector('.wrapper')
let localVideo = document.getElementById('localVideo');
var remoteVideo = document.getElementById('remoteVideo');
var stopButton = document.getElementById('stopButton');
var startButton = document.getElementById('startButton');

// Получение доступа к экрану
startButton.addEventListener('click', () => {

    navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(function (stream) {
            localVideo.srcObject = stream;
            // Создание объекта RTCPeerConnection
            var peerConnection = new RTCPeerConnection();

            // Добавление потока экрана в объект RTCPeerConnection
            stream.getTracks().forEach(function (track) {
                peerConnection.addTrack(track, stream);
            });
            stopButton.addEventListener('click', function () {
                stream.getTracks().forEach(function (track) {
                    track.stop();
                });
                peerConnection.close();
                localVideo.srcObject = null;
                remoteVideo.srcObject = null;
            });

            // Создание предложения для соединения
            return peerConnection.createOffer();
        })
        .then(function (offer) {
            // Установка локального описания в объект RTCPeerConnection
            return peerConnection.setLocalDescription(offer);
        })
        .then(function () {
            // Отправка описания предложения через сетевое соединение (например, WebSocket или сокеты)
            var offerDescription = peerConnection.localDescription;
            // Отправка offerDescription на получающее устройство (например, по IP-адресу или через Wi-Fi)
        })
        .catch(function (error) {
            // Обработка ошибок
            console.log(error);
        });
})

// Создание объекта RTCPeerConnection
var peerConnection = new RTCPeerConnection();

// Прослушивание события ontrack для получения потока экрана
peerConnection.ontrack = function (event) {
    remoteVideo.srcObject = event.streams[0];
    // Здесь вы можете использовать полученный remoteStream для отображения экрана на вашем устройстве
};

function handleOfferDescription(offerDescription) {
    // Отправка offerDescription на получающее устройство и получение ответа
    var answerDescription = null; // Получите ответное описание от получающего устройства
    if (answerDescription) {
        peerConnection.setRemoteDescription(answerDescription)
            .then(function () {
                console.log('Установлено соединение с удаленным устройством');
            })
            .catch(function (error) {
                console.log('Ошибка установки соединения с удаленным устройством:', error);
            });
    }
}

// Получение answerDescription с удаленного устройства
function handleAnswerDescription(answerDescription) {
    peerConnection.setRemoteDescription(answerDescription)
        .then(function () {
            console.log('Установлено соединение с удаленным устройством');
        })
        .catch(function (error) {
            console.log('Ошибка установки соединения с удаленным устройством:', error);
        });
}

// Получение offerDescription с удаленного устройства
function handleRemoteOffer(offerDescription) {
    peerConnection = new RTCPeerConnection();
    peerConnection.ontrack = function (event) {
        remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.setRemoteDescription(offerDescription)
        .then(function () {
            return peerConnection.createAnswer();
        })
        .then(function (answer) {
            return peerConnection.setLocalDescription(answer);
        })
        .then(function () {
            var answerDescription = peerConnection.localDescription;
            // Отправка answerDescription на отправляющее устройство
        })
        .catch(function (error) {
            console.log('Ошибка при обработке удаленного предложения:', error);
        });
}