function createNode(element) {
    return document.createElement(element);
}
function append(parent, el) {
    return parent.appendChild(el);
}

const getLineData = (initialData, lengthOfDataChunks) => {
    const numOfChunks = Math.ceil(initialData.length / lengthOfDataChunks);
    const dataChunks = [];

    for (var i = 0; i < numOfChunks; i++) dataChunks[i] = [];

    initialData.forEach((entry, index) => {
        const chunkNumber = Math.floor(index / lengthOfDataChunks);
        dataChunks[chunkNumber].push(entry);
    });

    const averagedChunks = dataChunks.map(chunkEntry => {
        const sumArray = (accumulator, currentValue) => accumulator + currentValue;
        const chunkAverage = chunkEntry.reduce(sumArray) / lengthOfDataChunks;
        return chunkAverage;
    });

    return averagedChunks;
}

place_name = 'Москва'
const API_KEY_YANDEX = '85eaff1b-ef9e-4c11-89bc-ca01d1ae43de'
const API_URL_GEO_DATA = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY_YANDEX}&geocode=${place_name}&format=json`
const url= API_URL_GEO_DATA;
fetch(url)
.then((resp) => resp.json())
.then(function(data) {
    POS = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos
    let X_Y = POS.split(' ')
    const API_OPEN_METEO = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${X_Y[0]}&longitude=${X_Y[1]}&hourly=pm10,pm2_5`
    if (X_Y) {
        fetch(API_OPEN_METEO).then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data)
            let parent = document.getElementById('air-pollution')
            if (parent) {
                let Main_table = createNode('table')
                let caption = createNode('caption')
                append(caption,(document.createTextNode(`Statistika po zagrjazneniju`)))
                append(Main_table,(caption))
                let row1 = createNode('tr')
                let th1 = createNode('th')
                let th2 = createNode('th')
                append(row1,th1)
                append(row1,th2)
                append(Main_table,row1)

                let row2 = createNode('tr')
                let th3 = createNode('th')
                let th4 = createNode('th')
                append(row2,th3)
                append(row2,th4)
                

                let table = createNode('table')
                let table2 = createNode('table')
                let header = createNode('tr')
                append(table,header)
                append(th1,table)
                append(th3,table2)
                append(Main_table,row1)
                append(Main_table,row2)

                
                for (const i in data.hourly_units) {
                    let th = createNode('th')
                    append(th,(document.createTextNode(i+'['+data.hourly_units[i]+']')))
                    header.appendChild(th)
                    th.style.border = "1px solid";
                }
                const isoTime = data.hourly.time;
                const pm10 = data.hourly.pm10;
                const pm2_5 = data.hourly.pm2_5;
                const lineDataPM10 = getLineData(pm10, 24);
                const lineDataPM2_5 = getLineData(pm2_5, 24);
                const lineDataTime = []

                for (let i = 0;i < lineDataPM10.length; i++) {
                    let row = createNode('tr')
                    let roww = createNode('tr')
                    let th1 = createNode('th')
                    lineDataTime.push(data.hourly.time[i*24].split('T')[0])
                    append(th1,(document.createTextNode(data.hourly.time[i*24])))
                    append(row,th1)
                    let th2 = createNode('th')
                    append(th2,(document.createTextNode(lineDataPM10[i].toFixed(3))))
                    append(row,th2)
                    let th3 = createNode('th')
                    append(th3,(document.createTextNode(lineDataPM2_5[i].toFixed(3))))
                    append(row,th3)
                    append(table,row)
                    append(table2,roww)
                }
                append(parent,Main_table)

                const ctx2 = createNode('canvas')
                append(th4,ctx2)
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                      labels: lineDataTime,
                      datasets: [{
                        label: Object.keys(data.hourly_units)[2]+", "+data.hourly_units.pm2_5,
                        data: lineDataPM2_5,
                        borderWidth: 1
                      }]
                    },
                    options: {
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }
                  });


                //Варинт 1       
                const canvas = createNode('canvas')
                append(th2,canvas)
                
                
                canvas.height = 500;
                canvas.width  = 550;
                
                // Указываем элемент для 2D рисования 
                // настраиваем на то, что бы рисовать 2D объекты
                const ctx = canvas.getContext('2d')
                
                
                // сделали по высоте метки допустимых значениях, 
                // а по ширине в качестве меток месяцы
                ctx.fillStyle = "black"; // Задаём чёрный цвет для линий 
                ctx.lineWidth = 2.0; // Ширина линии
                ctx.beginPath(); // Запускает путь
                ctx.moveTo(30, 10); // Указываем начальный путь
                ctx.lineTo(30, 460); // Перемешаем указатель
                ctx.lineTo(525, 460); // Ещё раз перемешаем указатель
                ctx.stroke(); // Делаем контур
                
                // Цвет для рисования
                ctx.fillStyle = "black";
                // Цикл для отображения значений по Y 
                for(let i = 0; i < lineDataTime.length; i++) { 
                    ctx.fillText((5 - i) * 20 + " ", 4, i * 80 + 60); /// Текст, X, Y
                    //ctx.beginPath(); // хз что это
                    ctx.moveTo(25, i * 80 + 60); 
                    ctx.lineTo(30, i * 80 + 60);  // четрочки на оси Y
                    //ctx.stroke(); // хз что это
                }
                
                // Выводим метки
                for(let i=0; i<lineDataTime.length; i++) { 
                    ctx.fillText(lineDataTime[i], 50+ i*100, 475); 
                    ctx.fillText(lineDataPM10[i].toFixed(3), 60+ i*100, 460-lineDataPM10[i]*5-15); 
                }
                
                // Рисуем столбцы
                // Назначаем зелёный цвет для графика
                ctx.fillStyle = "green"; 
                // Цикл для от рисовки графиков
                for(var i=0; i<lineDataPM10.length; i++) { 
                    var dp = lineDataPM10[i]; 
                    ctx.fillRect(50 + i*100, 460-dp*5 , 50, dp*5); 
                }
                table.style.border = "1px solid";
                
                
            }
        })
 }
});
