class ToggleLike{constructor(t){this.toggler=t,this.toggleLike();document.getElementsByClassName("toggle-like-button")}toggleLike(){$(this.toggler).click((function(t){t.preventDefault();let e=this;console.log($(e).attr("id"));$.ajax({type:"POST",url:$(e).attr("href")}).done((function(t){let l=parseInt($(e).attr("data-likes"));console.log(t),1==t.data.deleted?(l-=1,$(e).html(l+' Likes <i class="far fa-heart" style="color:black;"></i>')):(l+=1,$(e).html(l+' Likes <i class="fas fa-heart" style="color:red"></i>')),$(e).attr("data-likes",l)})).fail((function(t){console.log("error in completing the request")}))}))}}