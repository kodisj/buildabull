import React from 'react';
import Slider from 'react-slick';
import * as x from '../../ui-components';

export default function SimpleSlider() {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    accessibility: true,
    centerMode: true,
    centerPadding: '50px',
  };
  return (
    <Slider {...settings}>
      <div>
        <x.Component1 />
      </div>
      <div>
        <x.Component2 />
      </div>
      <div>
        <x.Group30 />
      </div>
    </Slider>
  );
}
