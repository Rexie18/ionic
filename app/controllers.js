$scope.favorite = favortiteFactory.favotires[];

	$scope.addToFavorites = function(index){
                var DishFav = $scope.dish = menuFactory.getDishes().get({id:10});
		$scope.favorite.push(DishFav);
	}

	service.getItems = function(){
		return $scope.favorite;
	};
}
