


/*
takes in the model name and returns the full path.
*/

var world = api.getWorldView(0);

model.unitKeys = _.keys(model.unitSpecs);


model.executeAsPlayer = function(playerIndex, command, commandVars, timeout){
    if(timeout == undefined){var timeout = 50}
    var switchPlayer = false;
    if(playerIndex !== "" && playerIndex !== undefined && playerIndex !== model.armyIndex()){switchPlayer = true}

    if(switchPlayer == true){
        console.log("attempting to switch player")                    
        api.Panel.message("devmode","switchControl",playerIndex);

        var tempFunc = function(commandVars){command(commandVars);}
        commandVars.unshift(null);
        setTimeout(tempFunc.bind(commandVars),timeout);
       		
            
        }
    else{
    console.log("running command as player")    
    command(commandVars);
    
    

    }



}

model.fullUnitName = function(unitName){

    if(model.unitKeys == []){ model.unitKeys = _.keys(model.unitSpecs);}
    unitName+=".json";
    var chosenUnit = "";
    
    for(var i = 0;i<model.unitKeys.length;i++){
        
        if(model.unitKeys[i].endsWith(unitName)){
            chosenUnit = model.unitKeys[i];
            
        }
    }
    if(!chosenUnit.length>1){return ""}
    return chosenUnit;

}
/*

if stateflag is true returns all of the unit states instead.

should probably add a unitflag to this in case I only want one unittypes states.

model.playerArmy(0,0,"",true).then(function(ready){console.log(ready)}) -test command

//adding unit types as an option would be good, e.g all fabs or all factorys
//unit type is things like Mobile, Construction, Etc

*/
model.playerArmy = function(playerId, planetId,unitType, stateFlag,unitTypeValue){
    //console.log(playerId+" | "+planetId+" | "+unitType+" | "+stateFlag)
    var promise = new Promise(function(resolve,reject){

        if(world){

            if(stateFlag !== true){
                
                
                
                var promise2 = world.getArmyUnits(playerId,planetId).then(function (result){
                    
                   // console.log(result)
                    if(unitType !== ""){result = result[unitType]}
                   // console.log(result)
                    return result
                
                
                
                
                })
                //console.log(promise2.then(function(result){console.log(result)}))
                resolve(promise2)
            
            
            
            }//TODO add unit filter here
    
            else{
                    var promise2 = world.getArmyUnits(playerId,planetId).then(function(result){ 
    
                    var unitArray = [];
                    
                    if(unitType !== ""){result = result[unitType]}
                    
                    armyKeys = _.keys(result)
                    for(var i = 0;i<armyKeys.length;i++){
                        unitArray.push(result[armyKeys[i]])
                    }
                    unitArray = _.flatten(unitArray)
                    //console.log(unitArray)
                   
    
                    return world.getUnitState(unitArray).then(function (ready) {
                        var unitData = this.result;
                        var one = !_.isArray(unitData);
                        if (one){
                                unitData = [unitData];
    
                        }
                        
                      return unitData;
                    }
                    
                   
                    )
                })
                
            }
            promise2.then(function(result){resolve(result)})
    
        }

    })

    promise.then(function(result){return result})
    
    return promise;
   


}

model.distanceBetween = function(point1,point2,R){
		
    //couldnt get great circle distance working/may have messed up taking it from previous code of mine so switching to straight line distance
    //it does mean area checks will not work well on small planets though. this would allow me to put the check point above the terrain to somewhat allievate it
    //var DistanceBetweenPoints = R*Math.acos((((point1[0])*(point2[0])+(point1[1])*(point2[1])+(point1[2])*(point2[2]))/(Math.pow(R,2))));
    var DistanceBetweenPoints = Math.pow((Math.pow((point2[0] - point1[0]),2) + Math.pow((point2[1] - point1[1]),2) + Math.pow((point2[2] - point1[2]),2)),0.5) 

    if(DistanceBetweenPoints == NaN ){console.log(point1 +" | "+ point2)}
    
    
    return DistanceBetweenPoints;
}

model.inRadius = function(point,center,R){
   
    if (model.distanceBetween(point,center,R) < R){
        
        return true;
    }
    else
        return false;
    
    
}
/*
returns either the number/id's of that unit type in the radius, or if type is not specified, total unit number/id's.
*/
model.countArmyInRadius = function(playerArmy,location,dataFlag){
    //console.log(JSON.stringify(playerArmy))
  


    var returnArray = [];

        returnValue = 0;
        
        for(var i = 0;i<playerArmy.length;i++){
            var unitPos = playerArmy[i].pos;
            if(this.inRadius(unitPos, location.pos, location.radius) == true){returnValue++;returnArray.push(playerArmy[i])}
        }
        
        
    
    if(dataFlag == true){return returnArray}

    else{return returnValue}
    
    


}
model.unitsInRadius = function(playerId,unitType, location, dataFlag){// this will be a rough function performance wise if reguarly checked so should be used sparingly.

    model.playerArmy(playerId,location[0].planet,unitType, true, model.countUnits)
   


    
}

model.randomLocations = function(amount,radius){ // returns array of random locations within 3d space of a certain radius
    
    var posArray = [];
    for(var points = 0; points<amount;points++){
                                    var pos1 = Math.floor(Math.random() * radius+1);
                                    var pos2 = Math.floor(Math.random() * radius+1);
                                    var pos3 = Math.floor(Math.random() * radius+1);
                                    
                                    posArray.push([pos1,pos2,pos3]);
                                    
                                    for(var count = 0; count<3;count++){
                                        var sign = Math.floor(Math.random() * 11);
                                        if (sign > 4){posArray[points][count] = posArray[points][count]*-1;}							
                                    }
    }
    
    return posArray;
}