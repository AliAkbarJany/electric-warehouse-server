const express=require ('express')
const cors=require('cors')
const app=express()

const jwt=require('jsonwebtoken')

const port=process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require ('dotenv').config()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.g7qv2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri)

async function run(){
    try{
        await client.connect()
        console.log('database connected')
        const devicesCollection=client.db('electric_warehouse').collection('devices')
        const allDevicesCollection=client.db('electric_warehouse').collection('allDevices')

        // get/Read all devices
        app.get('/devices',async(req,res)=>{
            // const email = req.query
            // console.log(email)
            const query={}
            const cursor=devicesCollection.find(query)
            const devices=await cursor.toArray()
            res.send(devices)
        })

        // get/Read single(1) device
        app.get('/devices/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const device=await devicesCollection.findOne(query)
            res.send(device)
        })

        //post/Add device
        app.post('/devices',async (req,res)=>{
            console.log('SERVER ',req.body)
            const newDevice=req.body
            console.log('body',newDevice)
            const result=await devicesCollection.insertOne(newDevice)
            res.send(result)
        })
        
        // delete device
        app.delete('/devices/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await devicesCollection.deleteOne(query)
            res.send(result)
        })

        // get/Read all Devices for (pagination)
        app.get('/allDevices',async(req,res)=>{
            console.log('query',req.query)
            const page =parseInt(req.query.page)
            const pageSize=parseInt(req.query.pageSize)
            const query={}
            const cursor=allDevicesCollection.find(query)
            let allDevices
            if(page || pageSize){
                allDevices=await cursor.skip(page*pageSize).limit(pageSize).toArray()
            }
            else{
                 allDevices=await cursor.toArray()
            }
            
            res.send(allDevices)
        })

        // (Count)..Pagination
        app.get('/allDevicesCount',async(req,res)=>{
            // const query={}
            // const cursor=allDevicesCollection.find(query)
            // const count= await cursor.count()
            const count= await allDevicesCollection.estimatedDocumentCount()
            res.send({count})
        })
    }
    finally{
        // await client.close()
    }

}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('Welcome to Electric Warehouse')
})
app.listen(port,()=>{
    console.log('Listening to port',port)
})