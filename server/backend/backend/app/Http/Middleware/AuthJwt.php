<?php


namespace App\Http\Middleware;
use Illuminate\Support\Facades\Auth;

use Closure;

class AuthJwt
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        try {
            $user = $this->guard()->userOrFail();
        } catch (\Tymon\JWTAuth\Exceptions\UserNotDefinedException $e) {
            
        return response()->json(['status' =>false, 'message' => $e->getMessage()], 200);

        }

        return $next($request);
     
    }

    public function guard()
    {
    return Auth::guard('api');
    }
}