pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/Jouini-Nour/devops-project.git'
            }
        }

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

    }
}