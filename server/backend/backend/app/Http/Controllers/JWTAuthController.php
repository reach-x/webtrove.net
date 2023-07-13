<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;



use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use Validator;

use Illuminate\Support\Str;

use App\User;
use App\User_bookmark_set;
use App\Bookmark;
use App\Bookmark_group;
use App\Bookmark_set;
use App\Bookmark_sets_x_bookmark_group;


use DB;

class JWTAuthController extends Controller
{
  

  public function login(Request $request)
 {
  	 $validator = Validator::make($request->all(), [ 
          'email' => 'required',
          'gtoken' => 'required'
      ]);
      
      if ($validator->fails()) { 
           return response()->json(['status'=> false,'message' => $validator->errors()], 200);
      }
     
     $email =  $request->input('email');
     $user =  User::where('email', $email)->get();



     if ($user->first()) {

         $token = auth('api')->tokenById($user->first()->user_id);
            return response()->json([ 'status'=> true,
                    'message'=> 'Login successfully.',
                    'token' => $token,
                    'token_type' => 'bearer',
                    'user'=>$user,
                    'expires_in' => $this->guard('api')->factory()->getTTL() * 60
            ]);
     
     }else{

        $user = new User;
        $user->password = bcrypt(Str::random(8));
        $user->email = $email;
        $user->name = '';
        $user->save();


        $ubs = new User_bookmark_set;

        $ubs->bookmark_set_id = 1;
        $ubs->user_id = $user->user_id;
        $ubs->save();

        $token = auth('api')->tokenById($user->user_id);

          return response()->json([ 'status'=> true,
                  'message'=> 'Login successfully.',
                  'token' => $token,
                  'token_type' => 'bearer',
                  'user'=>$user,
                  'expires_in' => $this->guard('api')->factory()->getTTL() * 60
          ]);

     }
 }

 /**
 * Get the authenticated User
 *
 * @return \Illuminate\Http\JsonResponse
 */
 public function me()
 {
  return response()->json($this->guard()->user());
 }

 /**
 * Log the user out (Invalidate the token)
 *
 * @return \Illuminate\Http\JsonResponse
 */
 public function logout()
 {
  $this->guard()->logout();

  return response()->json(['message' => 'Successfully logged out']);
 }

 /**
 * Refresh a token.
 *
 * @return \Illuminate\Http\JsonResponse
 */
 public function refresh()
 {
  return $this->respondWithToken($this->guard('api')->refresh());
 }

 /**
 * Get the token array structure.
 *
 * @param string $token
 *
 * @return \Illuminate\Http\JsonResponse
 */
 protected function respondWithToken($token)
 {

      return response()->json([ 'status'=> true,
      'message'=> 'Login successfully.',
      'token' => $token,
      'token_type' => 'bearer',
      'user'=>$user,
      'expires_in' => $this->guard('api')->factory()->getTTL() * 60
      ]);
 }

 /**
 * Get the guard to be used during authentication.
 *
 * @return \Illuminate\Contracts\Auth\Guard
 */
 public function guard()
 {
  return Auth::guard('api');
 }
 
 
public function getUserData(){

    $user_id =  auth('api')->user()->user_id;

    $assignedBookMarkSet = DB::select("SELECT t3.bookmark_set_id,  t3.bookmark_set FROM users t1 INNER JOIN user_bookmark_sets t2 ON (t1.user_id = t2.user_id) INNER JOIN bookmark_sets t3 on (t2.bookmark_set_id = t3.bookmark_set_id) WHERE t1.user_id = $user_id");


    $bookmark_set_id = $assignedBookMarkSet[0]->bookmark_set_id;
    $projectName =  $assignedBookMarkSet[0]->bookmark_set;


    $foundGroups = DB::select("SELECT t2.bookmark_group_id, t2.title, t2.order_id from bookmark_sets_x_bookmark_groups t1 INNER JOIN bookmark_groups t2 ON (t1.bookmark_group_id = t2.bookmark_group_id  ) WHERE t1.bookmark_set_id = $bookmark_set_id ");


    foreach ($foundGroups as $key => $value) {
        $value->bookmark_group_id;
        $links = DB::select("SELECT t1.bookmark, t1.url, t1.order_id from bookmarks t1  WHERE t1.bookmark_group_id =  $value->bookmark_group_id  ");

        $linksArray = array_map(function ($value1) {
        return (array)$value1;
        }, $links);
        $foundGroups[$key]->links =  $linksArray;
    }

  return response()->json([ 'status' =>true, 'project_title'=>$assignedBookMarkSet[0]->bookmark_set,  'bookmarks' =>  $foundGroups ]);
 }

 

 
 function register(Request $request){
     
        $validator = Validator::make($request->all(), [ 
            'firstName' => 'required',
            'lastName' => 'required',
            'email' => 'required|email', 
            'pwd' => 'required'
        
        ]);
        
        if ($validator->fails()) { 
            return response()->json(['error'=>$validator->errors()], 200);            
        }
        
         $fName =  $request->input('firstName');
         $lName =  $request->input('lastName');
         $email =  $request->input('email');
         $password =  $request->input('pwd');

        $found = DB::table('users')->where('email',$email)->count();
        
        if($found == 0){
            // sendEmail();
            
            $insertData = [];
            $insertData['name'] =  $fName.' '.$lName;
            $insertData['email'] =  $email;
            $insertData['password'] = bcrypt($password);;
          
            DB::table('users')->insert($insertData);
            
            return response()->json(['status'=> true,'message' => 'You have successfully registered.'], 200);
            
        }else{
            return response()->json(['status'=> false,'message' => 'User already exists.'], 200);
        }
 }
 
 
  function forGotPassword(Request $request){
        $validator = Validator::make($request->all(), [ 
            'forgotemail' => 'required|email'
        
        ]);
        
        if ($validator->fails()) { 
            return response()->json(['status'=> false,'message' => $validator->errors()], 200);
        }
        
        $email =  $request->input('forgotemail');

        $found = DB::table('users')->where('email',$email)->count();
        
        if($found != 0){
            // sendEmail();
            
            
            return response()->json(['status'=> true,'message' => 'Email has been sent.'], 200);
            
        }else{
            return response()->json(['status'=> false,'message' => 'User not found.'], 200);
        }
        
        
 }


}