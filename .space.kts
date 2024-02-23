job("Build and push the image of the pangolin") {
    host {
        dockerBuildPush {
            args["JB_SPACE_CLIENT_ID"] = "\$JB_SPACE_CLIENT_ID"
            args["JB_SPACE_CLIENT_SECRET"] = "\$JB_SPACE_CLIENT_SECRET"

            tags {
                +"packages.giant.space/p/zoo/containers/pangolin:\$JB_SPACE_EXECUTION_NUMBER"
            }
        }
    }
}