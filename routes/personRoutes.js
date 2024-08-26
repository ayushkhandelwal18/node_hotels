const express=require('express');
const router =express.Router();

const Person=require('./../models/pperson');

const {jwtAuthMiddleware , generateToken}=require('./../jwt');

router.post('/signup', async (req,res)=>{
    try{
   const data=req.body  //assuming the request body contains the person data
  
    //create a new person document using the mongoose model
    const newPerson =new Person(data);

    //save thenew person to the database 
    const response =await newPerson.save();
    console.log('data saved successfully');

    const payload ={
      id:response.id,
      username: response.username
    }

    console.log(JSON.stringify(payload));
    const token =generateToken(payload);
    console.log("Token is : ",token);

    res.status(200).json({response : response, token:token});
  }
  catch(err){
    console.log(err);
    res.status(500).json({error:'Internal server error'});
      }
  })

  //login route
  router.post('/login', async (req,res)=>{
  try{
    //extract username and password from request body
    const { username , password} =req.body;

    //find the user by username
    const user =await Person.findOne({username :username});

    //if user doesnot exist or password does not match , return error
    if(!user || !(await user.comparePassword(password))){
      return res.status(401).json({error: 'Invalid username or password'});
}
 
//generate token
const payload ={
  id :user.id,
  username : user.username
}

const token = generateToken(payload);

//return token as response 
res.json({token})


  }
  catch(err){
    console.error(err);
    res.status(500).json({error:'Internal Server error'});
  }
});

router.get('/profile',jwtAuthMiddleware ,async(req,res)=>{
  try{ 
           const userData = req.user;
           console.log("User Data : " , userData);
              
           const userId =userData.id;
           const user=await Person.findById(userId);

           res.status(200).json({user});

  }catch(err){
    console.error(err);
    res.status(500).json({error:'Internal Server error'});
  }
})


 //get method to get the person
  router.get('/' ,jwtAuthMiddleware, async(req,res)=>{
    try{
         const data = await Person.find();
         console.log('data fetched successfully');
         res.status(200).json(data);
    }
    catch(err){
      console.log(err);
      res.status(500).json({error:'Internal server error'});
    }
  })

  router.get('/:workType',async(req,res)=>{
   
    try{
      // // Extract the work type from the URL parameter
      const workType=req.params.workType;
      if(workType=='chef' || workType=='manager' || workType=='waiter'){
            const response=await Person.find({work:workType});
               console.log('response fatched');
               res.status(200).json(response);
      }
      else{
              res.status(404).json({erroe : 'Invalid work type'});
      }
    }
      catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
  
       }
    })

    router.put('/:id',async (req,res)=>{
      try{
           const personId =req.params.id;//extract the id from the URL prameter
           const updatePersonData =req.body;//updated data for the person

           const response=await Person.findByIdAndUpdate(personId ,updatePersonData,{
            new:true, //return the updated document
            runValidators:true, //run mongoose validation
           })

           if(!response){
            return res.status(404).json({error:'Person not found'});
           }

           console.log('data updated successsfully');
           res.status(200).json(response);
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Sever Error'});

           }
    })

    router.delete('/:id',async (req,res)=>{
      try{
        const personId =req.params.id; // Extract the person's ID from the URL parameter
        
         // Assuming you have a Person model
        const response=await Person.findByIdAndDelete(personId);

        if(!response){
          return res.status(404).json({error:'Person not found'});
         }

         console.log('data deleted successsfully');
           res.status(200).json({message: 'person deleted successsfully'} );
      }
      catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Sever Error'});

      }
    })

    module.exports=router;