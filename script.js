document.addEventListener("DOMContentLoaded", () => {

    const fetchButton = document.getElementById('fetch');
    const generateButton = document.getElementById('generate');
    const setFilter = document.getElementById('set-filter');
    const tableContainer = document.getElementById('table-container');

    fetchButton.addEventListener('click', fetchData);
    generateButton.addEventListener('click', processOneImage);
    setFilter.addEventListener('click', getFilteredData);

    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGn8HZhvGptzZmx2akDTzyGD0EGWJTMwnuZfd-BjQlMVOpLFTIMS8hGjESnZzXMm168okzvwxOgXzF/pub?gid=316498633&single=true&output=tsv';
    //const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGn8HZhvGptzZmx2akDTzyGD0EGWJTMwnuZfd-BjQlMVOpLFTIMS8hGjESnZzXMm168okzvwxOgXzF/pub?gid=1284844445&single=true&output=tsv'
    let cardData = [];
    let filteredCardData = [];

    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    let index = 0;

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);


    function fetchData() {
        fetchButton.textContent = 'Fetching...'
        fetchButton.setAttribute('disabled', true)
        fetchButton.style.cursor = 'not-allowed'
        fetch(sheetUrl)
            .then(response => response.text())
            .then(tsvData => {
                convertTSVtoObjects(tsvData);
                console.log(cardData)
                generateButton.removeAttribute('disabled')
                fetchButton.style.background = 'white'
                fetchButton.style.fontWeight = 'bold'
                fetchButton.style.color = '#777'
                fetchButton.textContent = 'Data fetched'
                document.getElementsByTagName('fieldset')[0].style.display = 'block'
                createDataTable(cardData);
            })
            .catch(error => {
                console.error('Error fetching TSV data:', error);
            });
    }

    function processOneImage() {    
        new Promise((resolve, reject) => {
            renderImage(filteredCardData[index])
        });
        if (index < filteredCardData.length) index++;
    }

    function convertTSVtoObjects(tsvData) {
        const rows = tsvData.split('\n').map(row => row.split('\t'));

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            cardData.push(
                {
                    id: row[0],
                    name: row[1],
                    attribute: row[2],
                    race: row[3],
                    frame: row[4],
                    property: row[5],
                    level: Number(row[6]),
                    atk: Number(row[7]),
                    def: Number(row[8])
                }
            )
        }
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    async function renderImage(currentCard) {

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        try {
            const grayImageSrc = "../assets/frame-gray.svg";
            const artworkImageSrc = "../assets/frame-artwork.svg";
            const frameSrc = `../assets/colors/color-${currentCard.frame.toLowerCase() || currentCard.attribute.toLowerCase()}.svg`;
            const raceSrc = ['SPELL', 'TRAP'].includes(currentCard.attribute)
                ? `../assets/type-${currentCard.attribute.toLowerCase()}.svg`
                : `../assets/types/type-${(currentCard.race).split(' ').join('-').toLowerCase()}.png`;
            const attributeSrc =  ['SPELL', 'TRAP'].includes(currentCard.attribute) ? '' : `../assets/attrs/attr-${currentCard.attribute.toLowerCase()}.png`;
            const cardImgSrc = `../assets/md_artworks/${currentCard.id}.png`;
            const atkValue = String(currentCard.atk)
            const defValue = String(currentCard.def)
            const starSrc = '../assets/level-star.svg';

            const grayImage = await loadImage(grayImageSrc);
            ctx.drawImage(grayImage, 0, 0);

            const frameImage = await loadImage(frameSrc);
            ctx.drawImage(frameImage, 0, 0);

            const artworkImage = await loadImage(artworkImageSrc);
            ctx.drawImage(artworkImage, 0, 0);

            const typeImage = await loadImage(raceSrc);
            attributeSrc ? ctx.drawImage(typeImage, 33, 245, 31, 31) : ctx.drawImage(typeImage, 0, 0);

            if (attributeSrc) {
                const attrImage = await loadImage(attributeSrc);
                ctx.drawImage(attrImage, 64, 245, 31, 31);
            }

            const cardArtImage = await loadImage(cardImgSrc);
            ctx.drawImage(cardArtImage, 26, 74, 164, 164);

            if (currentCard.atk) {
                drawStat('ATK', atkValue, 112, 257, ctx, currentCard);
                drawStat('DEF', defValue, 112, 272, ctx, currentCard);
            }

            let levelValue = currentCard.level;
            let levelConstant = levelValue == 13 ? 179.1 : 171;
            const starImage = await loadImage(starSrc); 
            for (let i = 0; i < levelValue; i++) {
                ctx.drawImage(starImage, (levelConstant - (i * 15.2)), 0); //15.5 >> 16
            }

            writeName(ctx, currentCard);

            d1(canvas, currentCard);
        }
        catch (err) {
            console.error('Error loading images:', err);
        }
    }

    function writeName(ctx, currentCard) {
        const cardName = currentCard.name;
        const usableName = cardName.length > 16 ? cardName.substring(0, 16) : cardName;
        if (currentCard.frame == 'Xyz') ctx.fillStyle = 'white'
        else ctx.fillStyle = 'black';
        ctx.font = "18px courier";
        ctx.fillText(usableName, 25.5, 32);
    }

    function d1(canvas, card) {
        const dataURL = canvas.toDataURL("image/png");
    
        const link = document.createElement("a");
        link.href = dataURL;
    
        link.download = `${card.id}.png`;
    
        link.click();
    }

    function drawStat(label, value, x, y, ctx, currentCard) {
        ctx.font = "bold 3.3mm Lucida Console";
        if (currentCard.frame == 'Xyz') ctx.fillStyle = 'white'
        else ctx.fillStyle = 'black';
        let labelSplit = label.split("");
        let valueSplit = value.split("");
        for (let i = 0; i < labelSplit.length; i++) {
            ctx.fillText(labelSplit[i], x+ (i*9), y)
        }
        for (let j = 0; j < valueSplit.length; j++) {
            ctx.fillText(valueSplit[j], x+38 + (j*10.5) + ((4-valueSplit.length) * 10.5), y)
        }
    }

    function getFilteredData() {
        filteredCardData = []
        const filteredCards = Array.from(document.getElementsByClassName('card-check'))
                                    .filter(checkBox => checkBox.checked)
                                    .map(checkBox => checkBox.id.slice(9))
                                    .map(idValue => cardData.find(card => card.id == idValue))
        filteredCardData = filteredCards;    
        console.log(filteredCards);
    }

    function createDataTable(cardData) {
        const table = document.createElement('table')
        table.id = 'data-table';
        table.innerHTML =`
        <thead>
            <td class='small-centered'>Select<br/>all</br><input type='checkbox' id='select-all'></td>
            <td class='bold'>DbID</td>
            <td class='bold'>Name</td>
            <td class='bold'>Frame</td>
        </thead>
        `;
        cardData.forEach(card => {
            table.innerHTML += `
            <tr>
                <td><input type='checkbox' value='${card.id}' id='checkbox-${card.id}' class='card-check' />
                <td>${card.id}</td>
                <td>${card.name}</td>
                <td class='${card.frame || card.attribute}'>${card.frame || card.attribute}</td>
            </tr>
            `
        });
        tableContainer.appendChild(table);
    }

    Array.from(document.getElementsByClassName('race-filter')).forEach(filter => filter.addEventListener('change', () => {
        filter.checked ? filterByRace(filter.value, true) : filterByRace(filter.value, false);
    }));

    function filterByRace(race, toggle) {
        const boxesToCheck = Array.from(document.getElementsByClassName('card-check'))
                                .map(checkBox => checkBox.id.slice(9))
                                .map(idValue => cardData.find(card => card.id == idValue))
                                .filter(card => card.race == race)
                                .map(card => Array.from(document.getElementsByClassName('card-check')).find(checkBox => checkBox.id == `checkbox-${card.id}`))
        console.log(boxesToCheck)
        boxesToCheck.forEach(box => box.checked = toggle)
    }

});