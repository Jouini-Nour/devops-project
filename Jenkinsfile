pipeline {

    agent any

    environment {
        IMAGE_NAME = "joujo/devops-app"
    }

    stages {

        stage('Install Dependencies') {
            steps {
                dir('app') {
                    sh 'npm install'
                }
            }
        }

        stage('Unit Tests') {
            steps {
                dir('app') {
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis') {

            steps {

                dir('app') {

                    withSonarQubeEnv('sonarqube') {

                        sh '''
                        sonar-scanner \
                        -Dsonar.projectKey=devops-app \
                        -Dsonar.sources=. \
                        '''

                    }

                }

            }

        }

    }

}