import { shuffle } from './shuffle';

//const imageFiles = require.context('../images/uploads', false, /\.png$/);

//const keys = imageFiles.keys();
//const images = keys.map(key => imageFiles(key));

const images = ["../images/uploads/1.png", "../images/uploads/2.png", "../images/uploads/3.png", "../images/uploads/4.png", "../images/uploads/5.png", "../images/uploads/6.png", "../images/uploads/7.png", "../images/uploads/8.png", "../images/uploads/9.png", "../images/uploads/10.png", "../images/uploads/11.png", "../images/uploads/12.png", "../images/uploads/13.png", "../images/uploads/14.png", "../images/uploads/15.png", "../images/uploads/16.png", "../images/uploads/17.png", "../images/uploads/18.png", "../images/uploads/19.png", "../images/uploads/20.png", "../images/uploads/21.png", "../images/uploads/22.png", "../images/uploads/23.png", "../images/uploads/24.png", "../images/uploads/25.png", "../images/uploads/26.png"];

export const init = (difficulty) => {
    let pics = [], seconds = 0;

    switch (difficulty) {
        case 0:
            pics = images.slice(0, 6);
            seconds = 20;
            break;
        case 1:
            pics = images.slice(0, 12);
            seconds = 30;
            break;
        case 2:
            pics = images.slice(0, 18);
            seconds = 40;
            break;
        case 3:
            pics = images.slice(0, 25);
            seconds = 45;
            break;
    }

    const items = shuffle([...pics, ...pics]);

    return {
        items,
        seconds
    };
};