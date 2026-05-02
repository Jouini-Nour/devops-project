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
                        -Dsonar.tests=tests \
                        -Dsonar.exclusions=**/node_modules/**
                        '''
                    }
                }
            }
        }



        stage('Docker Build') {
            steps {
                dir('app') {
                    sh """
                    docker build -t $IMAGE_NAME:${BUILD_NUMBER} .
                    """
                }
            }
        }

        stage('Trivy Scan') {
            steps {
                sh """
                trivy image $IMAGE_NAME:${BUILD_NUMBER}
                """
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {

                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_NAME:${BUILD_NUMBER}
                    """
                }
            }
        }
        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    sh 'terraform init'
                    sh 'terraform apply -auto-approve'
                }
            }
        }

        stage('Ansible Deploy') {
            steps {
                dir('ansible') {

                    sh """
                    ansible-playbook \
                    -i inventory \
                    deploy.yaml \
                    --extra-vars "image=$IMAGE_NAME:${BUILD_NUMBER}"
                    """
                }
            }
        }

        stage('Smoke Test') {
            steps {

                sh '''
                kubectl get pods -n devops
                kubectl get svc -n devops
                '''

            }
        }
    }
}