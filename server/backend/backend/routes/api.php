<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('login', 'JWTAuthController@login');
Route::post('register', 'JWTAuthController@register');
Route::post('forgot', 'JWTAuthController@forGotPassword');


Route::group([
    'middleware' => 'jwtauth',
], function ($router) {
    Route::post('logout', 'JWTAuthController@logout');
   Route::get('get-user-data', 'JWTAuthController@getUserData');   
      
});