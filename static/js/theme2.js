/*-----------------------------------------------------------------------------------
    
    Template Name: Pesco - Fashion eCommerce HTML Template
    URI: site.com 
    Description: Pesco is a clean, modern, and elegant fashion e-commerce HTML template. It allows you to easily create a well-designed e-commerce website that is easily customizable to fit your brand colors and requirements.
    Author: Pixelfit
    Author URI: https://themeforest.net/user/pixelfit
    Version: 1.0 

    
-----------------------------------------------------------------------------------*/

(function($) {
    'use strict';

    //===== Slick slider js

    if ($('.categories-slider').length) {
        $('.categories-slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 6,
            variableWidth: true,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="fas fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="fas fa-angle-right"></i></div>'
        });
    }
    if ($('.testimonial-slider').length) {
        $('.testimonial-slider').slick({
            dots: true,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="fas fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="fas fa-angle-right"></i></div>'
        });
    }
    if ($('.client-slider').length) {
        $('.client-slider').slick({
            dots: false,
            arrows: false,
            infinite: true,
            speed: 800,
            autoplay: false,
            slidesToShow: 7,
            slidesToScroll: 1,
            prevArrow: '<div class="prev"><i class="fas fa-angle-left"></i></div>',
            nextArrow: '<div class="next"><i class="fas fa-angle-right"></i></div>',
            responsive: [
                {
                    breakpoint: 1200,
                    settings: {
                        slidesToShow: 4,
                    }
                },
                {
                    breakpoint: 1024,
                    settings: {
                        slidesToShow: 3,
                    }
                },
                {
                    breakpoint: 767,
                    settings: {
                        slidesToShow: 2,
                    }
                },
                {
                    breakpoint: 450,
                    settings: {
                        slidesToShow: 1,
                    }
                }
            ]
        });
    }

    
})(window.jQuery);