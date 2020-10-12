
export default function(sequelize, DataTypes){
	const Guild = sequelize.define(`Guild`, {
		id: {
			type:DataTypes.STRING,
            primaryKey:true,
            unique: true    
		},
		name:{
			type:DataTypes.STRING
		}
	}, { 
        timestamps:false
    });
	Guild.associate = ({}) => {

	};
	Guild.fromDiscordGuild = (g)=>{
		return Guild.create({
			id:g.id,
			name:g.name,
		})
	}
	return Guild;
}
