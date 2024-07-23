//ver.1
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.game-container'); // เปลี่ยนชื่อ class
    const button = document.getElementById('shuffle-button');
    const emojis = ["🍑", "🍌", "🥝", "🍇", "🍓"];
    let selectedItem = null;
    let selectedEmoji = null;
    let clickedItem = null;
    let clickedEmoji = null;
    let isAnimating = false; // เพื่อป้องกันการคลิกระหว่างการลบอีโมจิ

    // ฟังก์ชันสร้างอีโมจิแบบสุ่ม
    function createRandomItem(row, col) {
        const item = document.createElement('div');
        item.classList.add('item', 'falling');
        item.dataset.emoji = emojis[Math.floor(Math.random() * emojis.length)];
        item.dataset.row = row;
        item.dataset.col = col;
        item.style.animationDelay = `${(7 - col) * 0.1}s`;
        return item;
    }

    // ฟังก์ชันเริ่มต้นสร้างตาราง
    function initializeGrid() {
        container.innerHTML = '';
        let grid = [];
        
        // สร้างตารางด้วยอีโมจิ
        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                const item = createRandomItem(i, j);
                row.push(item);
            }
            grid.push(row);
        }

        // เพิ่มอีโมจิลงใน container
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                container.appendChild(grid[i][j]);
            }
        }

        // ตรวจสอบว่ามีอีโมจิที่เรียงกันสามตัวหรือไม่
        ensureNoThreeInARow(grid);

        addEventListenersToItems(); // เพิ่ม event listener หลังจากสร้าง item
        addHoverListenersToItems(); // เพิ่ม hover event listener

        // ลบคลาส falling หลังจากที่ animation เสร็จสิ้น
        setTimeout(() => {
            const items = document.querySelectorAll('.item');
            items.forEach(item => {
                item.classList.remove('falling');
            });
        }, 1000); // ตรงกับระยะเวลาของ animation
    }

    // ฟังก์ชันตรวจสอบว่าไม่มีอีโมจิที่เรียงกันสามตัว
    function ensureNoThreeInARow(grid) {
        let isValid = false;

        while (!isValid) {
            isValid = true;
            
            // ตรวจสอบแนวนอนและแนวตั้งว่ามีอีโมจิที่เรียงกันสามตัวหรือไม่
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 6; j++) {
                    if (grid[i][j].dataset.emoji === grid[i][j + 1].dataset.emoji && 
                        grid[i][j].dataset.emoji === grid[i][j + 2].dataset.emoji) {
                        isValid = false;
                        // เปลี่ยนอีโมจิตัวใดตัวหนึ่ง
                        grid[i][j + 2].dataset.emoji = getRandomEmoji();
                    }
                }
            }
            
            for (let j = 0; j < 8; j++) {
                for (let i = 0; i < 6; i++) {
                    if (grid[i][j].dataset.emoji === grid[i + 1][j].dataset.emoji && 
                        grid[i][j].dataset.emoji === grid[i + 2][j].dataset.emoji) {
                        isValid = false;
                        // เปลี่ยนอีโมจิตัวใดตัวหนึ่ง
                        grid[i + 2][j].dataset.emoji = getRandomEmoji();
                    }
                }
            }
        }
    }

    // ฟังก์ชันสุ่มอีโมจิ
    function getRandomEmoji() {
        return emojis[Math.floor(Math.random() * emojis.length)];
    }

    // ฟังก์ชันสุ่ม shuffle อีโมจิ
    function shuffleItems() {
        const items = Array.from(container.children);
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(items[j]);
        }
    }

    // ฟังก์ชันหยุดการสั่น
    function stopShaking() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.classList.remove('shaking');
        });
        selectedItem = null;
        selectedEmoji = null;
        clickedItem = null;
        clickedEmoji = null;
    }

    // ฟังก์ชันจัดการ animation ของการสลับตำแหน่ง
    function animateSwap(item1, item2) {
        item1.classList.add('swap');
        item2.classList.add('swap');
        
        // ลบคลาส animation หลังจากที่ animation เสร็จสิ้น
        setTimeout(() => {
            item1.classList.remove('swap');
            item2.classList.remove('swap');
        }, 500); // ตรงกับระยะเวลาของ animation
    }

    // ฟังก์ชันจัดการเหตุการณ์คลิก
    function handleClick(event) {
        if (isAnimating) return; // หยุดการทำงานถ้ามีการลบอีโมจิอยู่

        const clicked = event.currentTarget;

        if (!selectedItem) {
            // คลิกแรก, เลือกอีโมจิ
            selectedItem = clicked;
            selectedEmoji = selectedItem.dataset.emoji;
            selectedItem.classList.add('shaking');
        } else {
            // คลิกที่สอง, ตรวจสอบว่าอยู่ติดกันในแนวนอนหรือแนวตั้งหรือไม่
            clickedItem = clicked;
            clickedEmoji = clickedItem.dataset.emoji;

            const row1 = parseInt(selectedItem.dataset.row, 10);
            const col1 = parseInt(selectedItem.dataset.col, 10);
            const row2 = parseInt(clickedItem.dataset.row, 10);
            const col2 = parseInt(clickedItem.dataset.col, 10);
            
            const isAdjacent = (
                (row1 === row2 && Math.abs(col1 - col2) === 1) ||  // แนวนอน
                (col1 === col2 && Math.abs(row1 - row2) === 1)    // แนวตั้ง
            );

            if (isAdjacent) {
                // สลับตำแหน่งอีโมจิชั่วคราว
                selectedItem.dataset.emoji = clickedEmoji;
                clickedItem.dataset.emoji = selectedEmoji;

                // แสดง animation การสลับตำแหน่ง
                animateSwap(selectedItem, clickedItem);

                // ตรวจสอบว่าเรียงกันสามตัวหรือไม่หลังจากสลับตำแหน่ง
                setTimeout(() => {
                    if (checkForMatches()) {
                        // ถ้ามีการเรียงกันสามตัว ลบอีโมจิที่ตรงกัน
                        isAnimating = true;
                        setTimeout(() => {
                            dropDownItems();
                            isAnimating = false;
                        }, 500); // ตรงกับระยะเวลาของ animation การลบ
                    } else {
                        // ถ้าไม่มีการเรียงกันสามตัว ให้เปลี่ยนตำแหน่งกลับที่เดิม
                        const tempEmoji = selectedItem.dataset.emoji;
                        selectedItem.dataset.emoji = clickedItem.dataset.emoji;
                        clickedItem.dataset.emoji = tempEmoji;
                    }
                }, 500); // ตรงกับระยะเวลาของ animation การสลับตำแหน่ง
            }

            // รีเซ็ตการเลือก
            stopShaking();
        }
    }

    // เพิ่ม event listener คลิกให้กับแต่ละ item
    function addEventListenersToItems() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.addEventListener('click', handleClick);
        });
    }

    // เพิ่ม event listener hover ให้กับแต่ละ item
    function addHoverListenersToItems() {
        const items = document.querySelectorAll('.item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                if (!selectedItem) {
                    item.classList.add('shaking');
                }
            });
            item.addEventListener('mouseleave', () => {
                if (!selectedItem) {
                    item.classList.remove('shaking');
                }
            });
        });
    }

    // ฟังก์ชันจัดการเหตุการณ์คลิกนอกพื้นที่ item เพื่อหยุดการสั่น
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.item')) {
            stopShaking();
        }
    });

    // ฟังก์ชันตรวจสอบและลบอีโมจิที่เรียงกันสามตัวขึ้นไป
    function checkForMatches() {
        const items = document.querySelectorAll('.item');
        let matches = [];
        let hasMatch = false;

        // ตรวจสอบแนวนอน
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 6; j++) {
                const item1 = items[i * 8 + j];
                const item2 = items[i * 8 + j + 1];
                const item3 = items[i * 8 + j + 2];
                if (item1.dataset.emoji === item2.dataset.emoji &&
                    item1.dataset.emoji === item3.dataset.emoji) {
                    matches.push(item1, item2, item3);
                    hasMatch = true;
                }
            }
        }

        // ตรวจสอบแนวตั้ง
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < 6; i++) {
                const item1 = items[i * 8 + j];
                const item2 = items[(i + 1) * 8 + j];
                const item3 = items[(i + 2) * 8 + j];
                if (item1.dataset.emoji === item2.dataset.emoji &&
                    item1.dataset.emoji === item3.dataset.emoji) {
                    matches.push(item1, item2, item3);
                    hasMatch = true;
                }
            }
        }

        // ลบ item ที่เรียงกันสามตัวขึ้นไป
        if (matches.length > 0) {
            matches.forEach(item => {
                item.dataset.emoji = '';
                item.classList.add('removed');
            });
        }

        return hasMatch;
    }

    // ฟังก์ชันเลื่อนอีโมจิลงมาเติมช่องว่างหลังจากลบ
    function dropDownItems() {
        const items = document.querySelectorAll('.item');
        for (let j = 0; j < 8; j++) {
            let emptySpots = 0;
            for (let i = 7; i >= 0; i--) {
                const item = items[i * 8 + j];
                if (item.dataset.emoji === '') {
                    emptySpots++;
                } else if (emptySpots > 0) {
                    const targetItem = items[(i + emptySpots) * 8 + j];
                    targetItem.dataset.emoji = item.dataset.emoji;
                    item.dataset.emoji = '';
                }
            }
            // เติมอีโมจิใหม่ในช่องว่างที่ด้านบน
            for (let k = 0; k < emptySpots; k++) {
                const newItem = items[k * 8 + j];
                newItem.dataset.emoji = getRandomEmoji();
            }
        }

        // ตรวจสอบอีกครั้งว่ามีการเรียงกันสามตัวขึ้นไปหรือไม่หลังจากเติมเต็ม
        setTimeout(() => {
            if (checkForMatches()) {
                setTimeout(() => {
                    dropDownItems();
                }, 500); // ตรงกับระยะเวลาของ animation การเลื่อนลง
            }
        }, 500); // ตรงกับระยะเวลาของ animation การเลื่อนลง
    }

    // เริ่มต้นสร้างตารางเมื่อโหลดหน้าเว็บเสร็จสิ้น
    initializeGrid();

    // ฟังก์ชันจัดการเหตุการณ์คลิกปุ่ม shuffle
    button.addEventListener('click', () => {
        shuffleItems();
    });
});
